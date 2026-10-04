import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import Ajv2020 from 'ajv/dist/2020.js';
import { sha256CanonicalJson } from '../scripts/marketplace-contract.mjs';
import { transferIssues, transferCapabilities, transferBundleIdentifiers, transferManifestIssues, publicTransferSensitivePaths } from '../scripts/transfer-contract.mjs';

const schema = JSON.parse(await readFile(new URL('../schemas/transfer-package.schema.json', import.meta.url)));
const validate = new Ajv2020({ allErrors: true, strict: true }).compile(schema);
const fixture = JSON.parse(await readFile(new URL('../examples/transfers/combination-and-app.example.json', import.meta.url)));
const valid = p => validate(p) && transferIssues(p).length === 0;

test('方案来源链接可选且仅用 HTTPS；不放行其他字段或嵌套链接', () => {
  const p = structuredClone(fixture);
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

test('冻结第一版样例可读；兼容此前导出，拒绝未知版本和混合步骤版本', async () => {
  const frozen = JSON.parse(await readFile(new URL('./fixtures/transfer-v1.json', import.meta.url)));
  assert.equal(sha256CanonicalJson(frozen), 'sha256:58261cfff9baf8f7cdb0fe5f6ee026f7cb931f0c86cc826aa4966aad51d707e5');
  assert.equal(frozen.schemaVersion, '1.0');
  assert.equal(valid(frozen), true);
  const previous = structuredClone(frozen);
  previous.schemaVersion = '0.2-draft';
  previous.macros.forEach(macro => { macro.schemaVersion = '0.3-draft'; });
  assert.equal(valid(previous), true);
  previous.macros[0].schemaVersion = '1.0';
  assert.equal(valid(previous), false);
  frozen.schemaVersion = '1.1';
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
  assert.deepEqual(transferCapabilities(fixture), ['openApplication', 'runMacro', 'sendKeyboardShortcut']);
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
    p => { p.applications[0].applicationPath = '/Applications/Example.app'; },
    p => { p.applications[0].payload = 'opaque'; },
    p => { p.schemaVersion = '0.1-draft'; },
    p => { p.macros.pop(); },
    p => { p.shortcuts = []; }
  ]) {
    const p = structuredClone(fixture); mutate(p); assert.equal(valid(p), false);
  }
});

test('分享不含个人设置，个人备份分组使用同一合同', () => {
  const p = structuredClone(fixture);
  p.hostSettings = { id: 'host.settings', audio: { gainDB: 12 } };
  p.roots.push({ kind: 'hostSettings', id: 'host.settings' });
  assert.equal(valid(p), false);
  p.exportPurpose = 'personalBackup';
  assert.equal(valid(p), true);
  p.hostSettings.audio.gainDB = 25;
  assert.equal(valid(p), false);
});

test('循环、重复 ID、超过 8 层拒绝，共享 DAG 不重复遍历', () => {
  let p = structuredClone(fixture);
  p.macros[1].steps = [{ stepID: 'cycle', action: 'runMacro', parameters: { nestedMacroID: p.macros[0].macroID, nestedMacroName: 'root' } }];
  assert.equal(valid(p), false);
  p = structuredClone(fixture); p.macros.push(p.macros[0]); assert.equal(valid(p), false);
  p = structuredClone(fixture);
  p.macros = Array.from({length: 8}, (_, i) => ({schemaVersion: '1.0', macroID: `example.node${i}`, version:'1.0.0', name:'Node', steps: i === 7 ? [] : [{stepID:'child', action:'runMacro', parameters:{nestedMacroID:`example.node${i + 1}`,nestedMacroName:'Node'}}]}));
  p.roots[0].id = 'example.node0'; assert.equal(valid(p), true);
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
