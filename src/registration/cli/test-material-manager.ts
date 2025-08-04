#!/usr/bin/env tsx
/**
 * CLI Test Harness for IMaterialManager Interface
 * Testing concrete implementation - interface segregation in action!
 * 
 * Usage: tsx test-material-manager.ts
 */

import type { IMaterialManager } from '../core/interfaces/index.js';
import type { Material } from '../core/types/index.js';
import { MaterialManager } from '../implementations/MaterialManager.js';

// TEST SUITE
async function testMaterialManager() {
  console.log('🧪 Testing IMaterialManager Interface...\n');
  
  // Use concrete implementation instead of mock!
  const materialManager = new MaterialManager();
  let passedTests = 0;
  let totalTests = 0;

  // Test 1: Upload Material
  totalTests++;
  try {
    // Create a mock File object that matches the browser File interface
    const mockFile = {
      name: 'test-document.pdf',
      size: 1024000,
      type: 'application/pdf',
      lastModified: Date.now(),
      webkitRelativePath: '',
      arrayBuffer: async () => new ArrayBuffer(1024000),
      bytes: async () => new Uint8Array(1024000),
      slice: (start?: number, end?: number, contentType?: string) => new Blob(),
      stream: () => new ReadableStream(),
      text: async () => 'mock file content'
    } as File;
    
    const materialId = await materialManager.uploadMaterial('workshop_1', mockFile);
    
    console.log('✅ Test 1: uploadMaterial()');
    console.log(`   Material ID: ${materialId}`);
    console.log('   ✅ Material uploaded successfully\n');
    
    passedTests++;
  } catch (error) {
    console.log('❌ Test 1: uploadMaterial() failed');
    console.log(`   Error: ${error}\n`);
  }

  // Test 2: Get Materials for Workshop
  totalTests++;
  try {
    const materials = await materialManager.getMaterials('workshop_1');
    
    console.log('✅ Test 2: getMaterials()');
    console.log(`   Workshop ID: workshop_1`);
    console.log(`   Found ${materials.length} materials:`);
    materials.forEach((material, index) => {
      console.log(`   ${index + 1}. ${material.originalName} (${material.fileName})`);
    });
    console.log('   ✅ Workshop materials retrieved successfully\n');
    
    passedTests++;
  } catch (error) {
    console.log('❌ Test 2: getMaterials() failed');
    console.log(`   Error: ${error}\n`);
  }

  // Test 3: Delete Material
  totalTests++;
  try {
    await materialManager.deleteMaterial('material_1');
    
    console.log('✅ Test 3: deleteMaterial()');
    console.log(`   Material ID: material_1`);
    console.log('   ✅ Material deleted successfully\n');
    
    passedTests++;
  } catch (error) {
    console.log('❌ Test 3: deleteMaterial() failed');
    console.log(`   Error: ${error}\n`);
  }

  // Test 4: Get Attendee Access
  totalTests++;
  try {
    const hasAccess = await materialManager.getAttendeeAccess('attendee_1', 'material_2');
    
    console.log('✅ Test 4: getAttendeeAccess()');
    console.log(`   Attendee ID: attendee_1`);
    console.log(`   Material ID: material_2`);
    console.log(`   Has Access: ${hasAccess}`);
    console.log('   ✅ Attendee access checked successfully\n');
    
    passedTests++;
  } catch (error) {
    console.log('❌ Test 4: getAttendeeAccess() failed');
    console.log(`   Error: ${error}\n`);
  }

  // Results Summary
  console.log('🎯 TEST RESULTS:');
  console.log(`   Passed: ${passedTests}/${totalTests}`);
  console.log(`   Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);
  
  if (passedTests === totalTests) {
    console.log('   🎉 ALL TESTS PASSED! IMaterialManager interface is ready for implementation!');
  } else {
    console.log('   ⚠️  Some tests failed. Interface needs review.');
    process.exit(1);
  }
}

// Run tests
testMaterialManager().catch(console.error);
