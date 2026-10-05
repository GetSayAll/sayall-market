import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import Ajv2020 from 'ajv/dist/2020.js';
import { sha256CanonicalJson } from '../scripts/marketplace-contract.mjs';
import { normalizeTransfer, transferIssues, transferCapabilities, transferBundleIdentifiers, transferManifestIssues, publicTransferSensitivePaths, transferCompatibilityIssues, selectCompatibleManifest } from '../scripts/transfer-contract.mjs';

const schema = JSON.parse(await readFile(new URL('../schemas/transfer-package.schema.json', import.meta.url)));
const validate = new Ajv2020({ allErrors: true, strict: true }).compile(schema);
const fixtureRaw = JSON.parse(await readFile(new URL('./fixtures/transfer-v1.json', import.meta.url)));
const fixture = normalizeTransfer(fixtureRaw);
const valid = p => transferIssues(p).length === 0;

test('方案来源链接可选且仅用 HTTPS；不放行其他字段或嵌套链接', () => {
  const p = structuredClone(fixture);
  p.exportPurpose = 'share';
  p.roots = [p.roots[0]]; p.hostSettings = undefined;
  p.website = 'https://sayall.app/market/';
  p.github = 'https://github.com/GetSayAll/sayall-market';
  assert.equal(valid(p), true);
  assert.deepEqual(publicTransferSensitivePaths(p), []);
  for (const key of ['website', 'github']) {
    const changed = structuredClone(p);
    changed[key] = 'https://user:password@example.com/other';
    assert.equal(valid(changed), false);
    assert.ok(publicTransferSensitivePaths(changed).includes(`$.${key}`));
    changed[key] = null;
    assert.equal(valid(changed), false);
  }
  const nested = structuredClone(p);
  nested.applications[0].website = p.website;
  assert.equal(valid(nested), false);
  assert.ok(publicTransferSensitivePaths(nested).includes('$.applications[0].website'));
  p.script = 'extra';
  assert.equal(valid(p), false);
});

test('1.0 文件只允许一个主对象；键位方案可携带组合动作依赖', () => {
  const profile = structuredClone(fixtureRaw);
  assert.equal(validate(profile), true);
  assert.equal(transferIssues(profile).length, 0);
  assert.equal(validate({ ...profile, macro: profile.profile }), false);
  assert.equal(validate({ ...profile, schemaVersion: '2.0' }), false);
});

test('当前 1.0 样例可读；拒绝旧版结构和未知版本', async () => {
  const frozen = JSON.parse(await readFile(new URL('./fixtures/transfer-v1.json', import.meta.url)));
  assert.equal(sha256CanonicalJson(frozen), 'sha256:a9257369a4db26c588ce0fd6ae29e187cd0e569246f711fa8452df2438f74e32');
  assert.equal(frozen.schemaVersion, '1.0');
  assert.equal(valid(frozen), true);
  const previous = structuredClone(frozen);
  delete previous.type;
  delete previous.profile;
  delete previous.dependencies;
  previous.roots = [{ kind: 'buttonProfile', id: previous.packageID }];
  previous.buttonProfiles = [frozen.profile];
  assert.equal(valid(previous), false);
  frozen.schemaVersion = '1.1';
  assert.equal(valid(frozen), true);
  frozen.requirements.minimumReaderVersion = '1.1';
  assert.equal(valid(frozen), false);
});

test('市场 App 声明包括关联、App 配置、输入框、步骤和作用域；顺序不影响结果', () => {
  const p = structuredClone(fixture);
  p.buttonProfiles = [{id:'example.profile',name:'Profile',remoteModel:'xiaomi-remote-2-pro',mode:'manual',applicationBundleIdentifiers:['com.example.rule'],bindings:[]}];
  p.macros[0].scope = {kind:'application',bundleIdentifiers:['com.example.scope']};
  p.focusTargets = [{id:'example.focus',displayName:'Input',bundleIdentifier:'com.example.focus'}];
  const apps = transferBundleIdentifiers(p);
  assert.ok(apps.includes('com.example.rule') && apps.includes('com.example.scope') && apps.includes('com.example.focus'));
  assert.ok(apps.includes(p.applications[0].bundleIdentifier));
  const declaration = values => ({compatibility:{bundleIdentifiers:values}});
  assert.deepEqual(transferManifestIssues(p,declaration([...apps].reverse())),[]);
  assert.equal(transferManifestIssues(p,declaration(apps.slice(1))).length,1);
  assert.equal(transferManifestIssues(p,declaration([...apps,'com.example.extra'])).length,1);
  assert.deepEqual(transferManifestIssues(p,{compatibility:{}}),[]);
  p.buttonProfiles = []; p.applications = []; p.focusTargets = []; p.macros = [];
  assert.deepEqual(transferManifestIssues(p,declaration([])),[]);
});

test('组合动作与 App 包内部引用完整，能力按真实步骤计算', () => {
  assert.equal(valid(fixture), true);
  assert.deepEqual(transferCapabilities(fixture), ['focusLearnedTarget', 'invokeMacro', 'openApplication', 'runMacro', 'sendKeyboardShortcut']);
  assert.deepEqual(publicTransferSensitivePaths(fixture), []);
});

test('内联按键与 Swift 对齐：拒绝控制和格式字符，保留可显示名称及空格', () => {
  const p = structuredClone(fixture);
  const parameters = { key: 'Return', modifiers: ['command'] };
  p.macros[1].steps = [{stepID:'inline',action:'sendKeyboardShortcut',parameters}];
  for (const key of ['\n', 'Return\n', '\t', '\u0000', '\u007f', '\u0085', '\u200b', '\ufeff']) {
    parameters.key = key;
    assert.equal(validate(p), false, JSON.stringify(key));
    assert.ok(transferIssues(p).length > 0, JSON.stringify(key));
  }
  for (const key of ['Return', ' ', '\u2028']) {
    parameters.key = key;
    assert.equal(valid(p), true, JSON.stringify(key));
  }
});

test('拒绝原机 App 路径、任意 payload、未知格式与缺失内部依赖', () => {
  for (const mutate of [
    p => { p.schemaVersion = '0.1-draft'; },
    p => { p.macros.pop(); },
    p => { p.shortcuts = []; }
  ]) {
    const p = structuredClone(fixture); mutate(p); assert.equal(valid(p), false);
  }
});

test('公开方案不含个人设置或个人备份', () => {
  const p = structuredClone(fixture);
  p.exportPurpose = 'share';
  p.hostSettings = { id: 'host.settings', audio: { gainDB: 12 } };
  p.roots.push({ kind: 'hostSettings', id: 'host.settings' });
  assert.equal(valid(p), false);
  p.exportPurpose = 'personalBackup';
  assert.equal(valid(p), false);
});

test('循环、重复 ID、超过 8 层拒绝，共享 DAG 不重复遍历', () => {
  let p = structuredClone(fixture);
  p.macros[1].steps = [{ stepID: 'cycle', action: 'runMacro', parameters: { nestedMacroID: p.macros[0].macroID, nestedMacroName: 'root' } }];
  assert.equal(valid(p), false);
  p = structuredClone(fixture); p.macros.push(p.macros[0]); assert.equal(valid(p), false);
  p = structuredClone(fixture);
  p.macros = Array.from({length: 8}, (_, i) => ({schemaVersion: '1.0', macroID: `example.node${i}`, version:'1.0.0', name:'Node', steps: i === 7 ? [] : [{stepID:'child', action:'runMacro', parameters:{nestedMacroID:`example.node${i + 1}`,nestedMacroName:'Node'}}]}));
  p.roots = [{kind:'macro',id:'example.node0'}]; p.buttonProfiles = []; p.applications = []; p.shortcuts = []; p.hostSettings = undefined; assert.equal(valid(p), true);
  p.macros[7].steps = [{stepID:'child',action:'runMacro',parameters:{nestedMacroID:'example.node8',nestedMacroName:'Node'}}];
  p.macros.push({...p.macros[7],macroID:'example.node8',steps:[]}); assert.equal(valid(p), false);
});

test('网络特征扫描只放行声明式 HTTP(S) URL 字段', () => {
  const p = structuredClone(fixture);
  p.macros[1].steps = [{stepID:'url',action:'openURL',parameters:{urlString:'https://example.com/help'}}];
  assert.equal(valid(p), true);
  assert.deepEqual(publicTransferSensitivePaths(p), []);
  p.macros[1].name = 'https://example.com/hidden';
  assert.ok(publicTransferSensitivePaths(p).length > 0);
  p.macros[1].steps[0].parameters.urlString = 'https://user:password@example.com';
  assert.equal(valid(p), false);
});

test('保留继承/禁用，拒绝重复按键与不同 App 的输入框引用', () => {
  const p = structuredClone(fixture);
  p.buttonProfiles = [{id:'example.profile',name:'Profile',remoteModel:'xiaomi-remote-2-pro',mode:'manual',applicationBundleIdentifiers:[],bindings:[{controlID:'ok',gesture:'singlePress',target:{kind:'inherit'}},{controlID:'back',gesture:'singlePress',target:{kind:'disabled'}}]}];
  p.roots.push({kind:'buttonProfile',id:'example.profile'});
  assert.equal(valid(p), true);
  p.buttonProfiles[0].bindings.push(p.buttonProfiles[0].bindings[0]);
  assert.equal(valid(p), false);
  p.buttonProfiles = [];
  p.roots.pop();
  p.focusTargets = [{id:'example.focus',displayName:'Composer',bundleIdentifier:'com.example.other'}];
  p.applications[0] = {...p.applications[0],focusStrategy:'recordedAccessibility',focusTargetID:'example.focus'};
  delete p.applications[0].shortcutID;
  assert.equal(valid(p), false);
});

test('合同与 Swift 对齐：全局空 App 列表、URL 大小写、左右修饰键及空白名称', () => {
  const p = structuredClone(fixture);
  p.macros[0].scope = {kind:'global',bundleIdentifiers:[]};
  p.macros[1].steps = [{stepID:'url',action:'openURL',parameters:{urlString:'HTTPS://example.com/help page'}}];
  p.shortcuts[0].modifiers = ['command']; p.shortcuts[0].deviceModifierFlags = 8;
  assert.equal(valid(p), true);
  p.shortcuts[0].deviceModifierFlags = 128; assert.equal(valid(p), false);
  p.shortcuts[0].deviceModifierFlags = 8; p.shortcuts[0].modifiers = []; assert.equal(valid(p), false);
  p.shortcuts[0].modifiers = ['command']; p.applications[0].displayName = ' '; assert.equal(valid(p), false);
  p.applications[0].displayName = 'App'; p.macros[1].steps[0].parameters.urlString = 'https://example.com/\n';
  assert.equal(valid(p), false);
});

test('首版读取器兼容矩阵：小版本、最低读取版本、能力和 App 版本分别判断', async () => {
  const cases = JSON.parse(await readFile(new URL('./fixtures/transfer-compatibility.json', import.meta.url)));
  for (const c of cases) assert.equal(transferCompatibilityIssues(c.schemaVersion, c.requirements, c.appVersion).length === 0, c.compatible, c.name);
});

test('未来的可选说明不改变动作；未知动作和混合主对象不能被静默忽略', () => {
  const p = structuredClone(fixtureRaw);
  p.schemaVersion = '1.1';
  p.extensions = {'org.example:notes': {author: '示例作者', description: '新增说明'}};
  assert.equal(validate(p), true);
  assert.equal(valid(p), true);
  const mixed = {...p, macro: p.dependencies.macros[0]};
  assert.equal(validate(mixed), false);
  p.dependencies.macros[0].steps[0].action = 'futureAction';
  assert.equal(validate(p), false);
  const previous = structuredClone(fixtureRaw);
  previous.minimumRemoteMicVersion = previous.requirements.minimumRemoteMicVersion;
  delete previous.requirements;
  assert.equal(validate(previous), false);
});

test('稳定目录同时列出 1.x 和 2.x；旧读取器选择最新可用方案', () => {
  const ref = (v, schema, minimum = '1.0', app = '1.0.0', caps = []) => ({packageID:'example.profile', version:v, contentSchemaVersion:schema, requirements:{minimumReaderVersion:minimum, minimumRemoteMicVersion:app, capabilities:caps}, manifestPath:`examples/manifests/${v}-${schema}.json`});
  const catalog = {manifests:[ref('3.0.0','2.0','2.0'), ref('2.0.0','1.1'),ref('1.0.0','1.0'),ref('4.0.0','1.2','1.0','9.0.0'),ref('5.0.0','1.2','1.0','1.0.0',['futureAction'])]};
  assert.equal(selectCompatibleManifest(catalog,'example.profile','2.0.0').version,'2.0.0');
  assert.equal(selectCompatibleManifest(catalog,'unknown','2.0.0'),null);
  assert.equal(selectCompatibleManifest({manifests:[catalog.manifests[0]]},'example.profile','2.0.0'),null);
});
