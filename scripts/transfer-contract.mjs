import { forbiddenContractKeyPattern, forbiddenContractValuePattern } from './marketplace-contract.mjs';

export function transferBundleIdentifiers(p) {
  return [...new Set([
    ...p.buttonProfiles.flatMap(profile => profile.applicationBundleIdentifiers),
    ...p.applications.map(app => app.bundleIdentifier),
    ...p.focusTargets.map(focus => focus.bundleIdentifier),
    ...p.macros.flatMap(macro => [
      ...(macro.scope?.bundleIdentifiers ?? []),
      ...macro.steps.flatMap(step => step.parameters.bundleIdentifier ? [step.parameters.bundleIdentifier] : [])
    ])
  ])].sort();
}

export function transferManifestIssues(p, manifest) {
  const declared = manifest.compatibility.bundleIdentifiers;
  return declared !== undefined && JSON.stringify([...declared].sort()) !== JSON.stringify(transferBundleIdentifiers(p))
    ? ['compatibility.bundleIdentifiers 与包内完整 App 集合不一致'] : [];
}

/** Semantic constraints supplement JSON Schema. No I/O or action execution. */
export function transferIssues(p) {
  const errors = [];
  const fail = (path) => errors.push(path);
  const macroVersion = p.schemaVersion === '0.2-draft' ? '0.3-draft' : '1.0';
  for (const macro of p.macros) if (macro.schemaVersion !== macroVersion) fail(`macro:${macro.macroID}:schemaVersion`);
  const maps = {};
  const text = (value) => typeof value === 'string' && value.trim().length > 0 && !/[\u0000-\u001f\u007f-\u009f]/u.test(value);
  for (const values of [p.shortcuts, p.focusTargets, p.applications])
    for (const value of values) if (!text(value.displayName)) fail(`text:${value.id}`);
  for (const s of p.shortcuts) if (!text(s.keyLabel)) fail(`shortcut:${s.id}:keyLabel`);
  for (const profile of p.buttonProfiles) if (!text(profile.name)) fail(`profile:${profile.id}:name`);
  for (const focus of p.focusTargets) if (focus.target) {
    const t = focus.target;
    const semantics = [t.identifier, t.title, t.elementDescription, t.help, t.placeholder, t.context].join(' ').toLowerCase();
    const sensitive = ['password','passcode','secret','api key','apikey','token','credit card','search','find','filter','address bar','settings','preferences','密码','口令','密钥','令牌','银行卡','搜索','查找','筛选','设置','偏好'];
    if (!semantics.trim() || sensitive.some(term => semantics.includes(term))) fail(`focus:${focus.id}:unsafe`);
  }
  for (const [kind, values, key] of [
    ['macro', p.macros, 'macroID'], ['shortcut', p.shortcuts, 'id'],
    ['focus', p.focusTargets, 'id'], ['application', p.applications, 'id'],
    ['buttonProfile', p.buttonProfiles, 'id']
  ]) {
    maps[kind] = new Map();
    for (const value of values) {
      if (maps[kind].has(value[key])) fail(`${kind}:duplicate:${value[key]}`);
      maps[kind].set(value[key], value);
    }
  }
  if (p.hostSettings) maps.hostSettings = new Map([[p.hostSettings.id, p.hostSettings]]);
  for (const root of p.roots) if (!maps[root.kind]?.has(root.id)) fail(`roots:${root.kind}:${root.id}`);
  const reference = (kind, id, path) => {
    if (!maps[kind]?.has(id)) fail(path);
    return maps[kind]?.get(id);
  };
  const bindings = (values) => {
    const seen = new Set();
    for (const b of values) {
      const key = `${b.controlID}:${b.gesture}`;
      if (seen.has(key)) fail(`bindings:duplicate:${key}`);
      seen.add(key);
      if (['macro', 'shortcut', 'application'].includes(b.target.kind))
        reference(b.target.kind, b.target.referenceID, `binding:${key}`);
    }
  };
  for (const profile of p.buttonProfiles) bindings(profile.bindings);
  if (p.hostSettings?.mappings) bindings(p.hostSettings.mappings.bindings);
  for (const a of p.applications) {
    if (a.shortcutID) reference('shortcut', a.shortcutID, `application:${a.id}:shortcut`);
    if (a.focusTargetID) {
      const focus = reference('focus', a.focusTargetID, `application:${a.id}:focus`);
      if (focus && focus.bundleIdentifier !== a.bundleIdentifier) fail(`application:${a.id}:bundle`);
    }
  }
  for (const m of p.macros) {
    if (!m.name.trim()) fail(`macro:${m.macroID}:name`);
    const steps = new Set();
    for (const step of m.steps) {
      if (steps.has(step.stepID)) fail(`macro:${m.macroID}:duplicateStep`);
      steps.add(step.stepID);
      const v = step.parameters;
      if (step.action === 'sendKeyboardShortcut' && v.key !== undefined && /[\p{Cc}\p{Cf}]/u.test(v.key)) fail(`macro:${m.macroID}:key`);
      if (['shortcutIdentifier','shortcutName','nestedMacroName'].some(key => v[key] !== undefined && !text(v[key]))) fail(`macro:${m.macroID}:text`);
      if (v.shortcutProfileKey) reference('shortcut', v.shortcutProfileKey, `macro:${m.macroID}:shortcut`);
      if (v.localProfileKey) {
        const f = reference('focus', v.localProfileKey, `macro:${m.macroID}:focus`);
        if (f && f.bundleIdentifier !== v.bundleIdentifier) fail(`macro:${m.macroID}:bundle`);
      }
      if (v.nestedMacroID) reference('macro', v.nestedMacroID, `macro:${m.macroID}:nested`);
      if (step.action === 'openURL') {
        try {
          const url = new URL(v.urlString);
          if (!['https:', 'http:'].includes(url.protocol) || !url.hostname || url.username || url.password || /[\u0000-\u001f\u007f-\u009f]/u.test(v.urlString))
            fail(`macro:${m.macroID}:url`);
        } catch { fail(`macro:${m.macroID}:url`); }
      }
    }
  }
  const heights = new Map();
  const visit = (id, path = []) => {
    if (path.includes(id) || path.length >= 8) { fail(`macro:${id}:cycleOrDepth`); return 9; }
    if (heights.has(id)) return heights.get(id);
    let height = 1;
    for (const step of maps.macro.get(id)?.steps ?? []) {
      if (step.parameters.nestedMacroID) height = Math.max(height, 1 + visit(step.parameters.nestedMacroID, [...path, id]));
    }
    if (height > 8) fail(`macro:${id}:cycleOrDepth`);
    heights.set(id, height);
    return height;
  };
  for (const shortcut of p.shortcuts) {
    const flags = shortcut.deviceModifierFlags ?? 0;
    if ((flags & ~0x207f) !== 0) fail(`shortcut:${shortcut.id}:deviceModifierFlags`);
    for (const [mask, modifier] of [[0x2001, 'control'], [0x6, 'shift'], [0x18, 'command'], [0x60, 'option']]) {
      if ((flags & mask) !== 0 && !shortcut.modifiers.includes(modifier)) fail(`shortcut:${shortcut.id}:deviceModifierFlags`);
    }
  }
  for (const id of maps.macro.keys()) visit(id);
  return errors;
}

export function transferCapabilities(p) {
  const result = new Set();
  for (const m of p.macros) for (const s of m.steps) result.add(s.action);
  for (const profile of p.buttonProfiles) for (const b of profile.bindings) {
    const c = { macro: 'invokeMacro', shortcut: 'sendKeyboardShortcut', application: 'openApplication', host: 'builtInAction' }[b.target.kind];
    if (c) result.add(c);
  }
  for (const a of p.applications) {
    result.add('openApplication');
    if (a.focusStrategy === 'keyboardShortcut') result.add('sendKeyboardShortcut');
    if (a.focusStrategy === 'recordedAccessibility') result.add('focusLearnedTarget');
  }
  return [...result].sort();
}

/** Only an explicitly validated openURL step permits a declared http(s) URL. */
export function publicTransferSensitivePaths(value, path = '$', allowURL = false) {
  if (Array.isArray(value)) return value.flatMap((v, i) => publicTransferSensitivePaths(v, `${path}[${i}]`));
  if (value && typeof value === 'object') return Object.entries(value).flatMap(([key, child]) => [
    ...(forbiddenContractKeyPattern.test(key) || key === 'target' && value.bundleIdentifier && value.id ? [`${path}.${key}`] : []),
    ...publicTransferSensitivePaths(child, `${path}.${key}`, key === 'urlString' && path.endsWith('.parameters'))
  ]);
  if (typeof value !== 'string') return [];
  if (allowURL) {
    try {
      const url = new URL(value);
      if (['https:', 'http:'].includes(url.protocol) && url.hostname && !url.username && !url.password) return [];
    } catch { /* Invalid URLs are rejected, not globally exempted. */ }
  }
  return forbiddenContractValuePattern.test(value) ? [path] : [];
}
