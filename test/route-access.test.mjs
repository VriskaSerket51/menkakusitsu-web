import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Permission, canAccessRoute } from '../src/features/auth/token.ts';
test('route guards preserve guest-only and hierarchical permissions', () => {
  const guest = { permission: Permission.Guest }, student = { permission: Permission.Student }, teacher = { permission: Permission.Teacher }, dev = { permission: Permission.Dev };
  assert.equal(canAccessRoute(guest, undefined), true);
  assert.equal(canAccessRoute(guest, { permission: Permission.Guest, exact: true }), true);
  assert.equal(canAccessRoute(student, { permission: Permission.Guest, exact: true }), false);
  assert.equal(canAccessRoute(guest, { permission: Permission.Student }), false);
  assert.equal(canAccessRoute(student, { permission: Permission.Student }), true);
  assert.equal(canAccessRoute(student, { permission: Permission.Teacher }), false);
  assert.equal(canAccessRoute(teacher, { permission: Permission.Teacher }), true);
  assert.equal(canAccessRoute(teacher, { permission: Permission.Dev }), false);
  assert.equal(canAccessRoute(dev, { permission: Permission.Student }), true);
  assert.equal(canAccessRoute(guest, { permission: Permission.Student }), false);
});
