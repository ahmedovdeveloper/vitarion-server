import test from 'node:test';
import assert from 'node:assert/strict';

import { sanitizeCommentPayload } from '../utils/commentValidation.js';

test('sanitizeCommentPayload trims and limits content', () => {
  const payload = sanitizeCommentPayload({
    name: '  Alice  ',
    comment: '  Great product!  ',
    rating: 5,
  });

  assert.equal(payload.name, 'Alice');
  assert.equal(payload.comment, 'Great product!');
  assert.equal(payload.rating, 5);
});

test('sanitizeCommentPayload clamps invalid rating and empty comment', () => {
  const payload = sanitizeCommentPayload({
    name: '',
    comment: '   ',
    rating: 9,
  });

  assert.equal(payload.name, 'Anonymous');
  assert.equal(payload.comment, '');
  assert.equal(payload.rating, 5);
});
