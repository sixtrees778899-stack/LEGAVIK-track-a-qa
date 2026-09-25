import test from 'node:test';import assert from 'node:assert/strict';
import { validateKnowledgeMap,assertValidKnowledgeMap } from '../../src/knowledge/validator.js';
import { loadJson } from '../helpers/load-fixture.js';

const valid=await loadJson('../fixtures/knowledge-valid.json'),invalid=await loadJson('../fixtures/knowledge-invalid.json');
test('valid Recovery Knowledge Map passes',()=>assert.equal(validateKnowledgeMap(valid).valid,true));
test('invalid fixture reports multiple errors',()=>assert.ok(validateKnowledgeMap(invalid).errors.length>=5));
test('unknown fields are rejected',()=>assert.ok(validateKnowledgeMap(invalid).errors.some((x)=>x.code==='UNKNOWN_FIELD')));
test('missing references are rejected',()=>assert.ok(validateKnowledgeMap(invalid).errors.some((x)=>x.code==='MISSING_REFERENCE')));
test('duplicate IDs are rejected',()=>{const copy=structuredClone(valid);copy.locations.push({...copy.locations[0]});assert.ok(validateKnowledgeMap(copy).errors.some((x)=>x.code==='DUPLICATE_ID'));});
test('wrong reference types are rejected',()=>{const copy=structuredClone(valid);copy.assets[0].location_refs=['contact-helper-1'];assert.ok(validateKnowledgeMap(copy).errors.some((x)=>x.code==='WRONG_REFERENCE_TYPE'));});
test('invalid attachment hash is rejected',()=>{const copy=structuredClone(valid);copy.attachments[0].sha256='bad';assert.ok(validateKnowledgeMap(copy).errors.some((x)=>x.code==='FORMAT'));});
test('invalid or non-normalized attachment MIME is rejected',()=>{for(const mediaType of ['text/plain; charset=utf-8','TEXT/PLAIN']){const copy=structuredClone(valid);copy.attachments[0].media_type=mediaType;assert.ok(validateKnowledgeMap(copy).errors.some((x)=>x.path.endsWith('.media_type')));}});
test('assert validator fails closed',()=>assert.throws(()=>assertValidKnowledgeMap(invalid),/validation failed/));
