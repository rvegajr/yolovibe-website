#!/usr/bin/env tsx
/**
 * CLI Test Harness for IMaterialManager Interface
 * Tests workshop material management and distribution
 * 
 * Usage: tsx test-material-manager.ts
 */

import type { IMaterialManager } from '../core/interfaces/index.js';
import type { Material, File } from '../core/types/index.js';

// Mock implementation for testing
class MockMaterialManager implements IMaterialManager {
  private materials: Map<string, Material> = new Map();
  private nextId = 1;

  constructor() {
    // Pre-populate with test materials
    const material1: Material = {
      id: 'material_1',
      workshopId: 'workshop_1',
      fileName: 'yolo-workshop-handbook.pdf',
      originalName: 'YOLO Workshop Handbook.pdf',
      fileSize: 2048000, // 2MB
      mimeType: 'application/pdf',
      uploadDate: new Date('2025-01-01'),
      downloadUrl: 'https://example.com/materials/handbook.pdf',
      accessLevel: 'attendees_only'
    };

    const material2: Material = {
      id: 'material_2',
      workshopId: 'workshop_2',
      fileName: 'workshop-slides.pptx',
      originalName: 'Workshop Presentation Slides.pptx',
      fileSize: 15360000, // 15MB
      mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      uploadDate: new Date('2025-01-02'),
      downloadUrl: 'https://example.com/materials/slides.pptx',
      accessLevel: 'attendees_only'
    };

    const material3: Material = {
      id: 'material_3',
      workshopId: 'workshop_1',
      fileName: 'practice-exercises.zip',
      originalName: 'Practice Exercises.zip',
      fileSize: 5120000, // 5MB
      mimeType: 'application/zip',
      uploadDate: new Date('2025-01-03'),
      downloadUrl: 'https://example.com/materials/exercises.zip',
      accessLevel: 'public'
    };

    this.materials.set(material1.id, material1);
    this.materials.set(material2.id, material2);
    this.materials.set(material3.id, material3);
  }

  async uploadMaterial(workshopId: string, file: File): Promise<string> {
    const materialId = `material_${this.nextId++}`;
    
    const material: Material = {
      id: materialId,
      workshopId,
      fileName: file.name.toLowerCase().replace(/\s+/g, '-'),
      originalName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      uploadDate: new Date(),
      downloadUrl: `https://example.com/materials/${materialId}`,
      accessLevel: 'attendees_only'
    };

    this.materials.set(materialId, material);
    return materialId;
  }

  async getMaterials(workshopId: string): Promise<Material[]> {
    return Array.from(this.materials.values())
      .filter(material => material.workshopId === workshopId)
      .sort((a, b) => a.uploadDate.getTime() - b.uploadDate.getTime());
  }

  async deleteMaterial(materialId: string): Promise<void> {
    if (!this.materials.has(materialId)) {
      throw new Error(`Material not found: ${materialId}`);
    }
    this.materials.delete(materialId);
  }

  async getAttendeeAccess(attendeeId: string, materialId: string): Promise<boolean> {
    const material = this.materials.get(materialId);
    if (!material) {
      return false;
    }

    // Public materials are always accessible
    if (material.accessLevel === 'public') {
      return true;
    }

    // For attendees_only and admin_only, we'd normally check database
    // For this mock, we'll simulate some access logic
    if (material.accessLevel === 'attendees_only') {
      // Mock: attendees with IDs ending in 1, 2, 3 have access
      return ['1', '2', '3'].some(suffix => attendeeId.endsWith(suffix));
    }

    if (material.accessLevel === 'admin_only') {
      // Mock: only admin attendees have access
      return attendeeId.includes('admin');
    }

    return false;
  }
}

// TEST SUITE
async function runTests() {
  console.log('🧪 Testing IMaterialManager Interface...\n');
  
  const manager = new MockMaterialManager();
  let passedTests = 0;
  let totalTests = 0;

  // Test 1: Upload Material
  totalTests++;
  try {
    const mockFile: File = {
      name: 'Test Material.pdf',
      size: 1024,
      type: 'application/pdf',
      lastModified: Date.now(),
      arrayBuffer: async () => new ArrayBuffer(1024),
      text: async () => 'mock file content'
    };
    
    const materialId = await manager.uploadMaterial('workshop_1', mockFile);
    
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
    const materials = await manager.getMaterials('workshop_1');
    
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
    await manager.deleteMaterial('material_1');
    
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
    const hasAccess = await manager.getAttendeeAccess('attendee_1', 'material_2');
    
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
runTests().catch(console.error);
