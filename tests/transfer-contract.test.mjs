import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import Ajv2020 from 'ajv/dist/2020.js';
import { transferIssues, transferCapabilities, publicTransferSensitivePaths } from '../scripts/transfer-contract.mjs';

const schema = JSON.parse(await readFile(new URL('../schemas/transfer-package.schema.json', import.meta.url)));
const validate = new Ajv2020({ allErrors: true, strict: true }).compile(schema);
const fixture = JSON.parse(await readFile(new URL('../examples/transfers/combination-and-app.draft.json', import.meta.url)));
const valid = p => validate(p) && transferIssues(p).length === 0;

test('组合动作与 App 包内部引用完整，能力按真实步骤计算', () => {
  assert.equal(valid(fixture), true);
  assert.deepEqual(transferCapabilities(fixture), ['openApplication', 'runMacro', 'sendKeyboardShortcut']);
  assert.deepEqual(publicTransferSensitivePaths(fixture), []);
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
  p.macros = Array.from({length: 8}, (_, i) => ({schemaVersion: '0.3-draft', macroID: `example.node${i}`, version:'1.0.0', name:'Node', steps: i === 7 ? [] : [{stepID:'child', action:'runMacro', parameters:{nestedMacroID:`example.node${i + 1}`,nestedMacroName:'Node'}}]}));
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
