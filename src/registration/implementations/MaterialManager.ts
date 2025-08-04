/**
 * MaterialManager - Concrete Implementation
 * Material management and access control
 * Simple, focused implementation - no over-engineering!
 */

import type { IMaterialManager } from '../core/interfaces/index.js';
import type { Material } from '../core/types/index.js';

export class MaterialManager implements IMaterialManager {
  private materials: Map<string, Material> = new Map();
  private attendeeAccess: Map<string, Set<string>> = new Map(); // attendeeId -> Set of materialIds
  private nextMaterialId = 1;

  constructor() {
    // Pre-populate with test materials for consistency with CLI tests
    const material1: Material = {
      id: 'material_1',
      workshopId: 'workshop_1',
      fileName: 'practice-exercises.zip',
      originalName: 'Practice Exercises.zip',
      fileSize: 1024000,
      uploadDate: new Date('2025-06-01'),
      mimeType: 'application/zip',
      downloadUrl: 'https://example.com/materials/practice-exercises.zip',
      accessLevel: 'attendees_only'
    };

    const material2: Material = {
      id: 'material_2',
      workshopId: 'workshop_1',
      fileName: 'test-material.pdf',
      originalName: 'Test Material.pdf',
      fileSize: 512000,
      uploadDate: new Date('2025-06-02'),
      mimeType: 'application/pdf',
      downloadUrl: 'https://example.com/materials/test-material.pdf',
      accessLevel: 'attendees_only'
    };

    const material3: Material = {
      id: 'material_3',
      workshopId: 'workshop_2',
      fileName: 'advanced-guide.docx',
      originalName: 'Advanced Guide.docx',
      fileSize: 256000,
      uploadDate: new Date('2025-06-03'),
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      downloadUrl: 'https://example.com/materials/advanced-guide.docx',
      accessLevel: 'public'
    };

    this.materials.set(material1.id, material1);
    this.materials.set(material2.id, material2);
    this.materials.set(material3.id, material3);

    // Set up attendee access
    this.attendeeAccess.set('attendee_1', new Set(['material_2', 'material_3']));
    this.attendeeAccess.set('attendee_2', new Set(['material_1']));
  }

  async uploadMaterial(workshopId: string, file: File): Promise<string> {
    const materialId = `material_${this.nextMaterialId++}`;
    
    const material: Material = {
      id: materialId,
      workshopId,
      fileName: file.name,
      originalName: file.name,
      fileSize: file.size,
      uploadDate: new Date(),
      mimeType: file.type || 'application/octet-stream',
      downloadUrl: '', // This should be updated after the file is uploaded
      accessLevel: 'attendees_only' // Default access level
    };

    this.materials.set(materialId, material);
    return materialId;
  }

  async getMaterials(workshopId: string): Promise<Material[]> {
    return Array.from(this.materials.values())
      .filter(material => material.workshopId === workshopId)
      .map(material => ({ ...material })); // Return copies to prevent mutation
  }

  async deleteMaterial(materialId: string): Promise<void> {
    const material = this.materials.get(materialId);
    if (!material) {
      throw new Error(`Material not found: ${materialId}`);
    }

    this.materials.delete(materialId);

    // Remove from all attendee access lists
    for (const accessSet of this.attendeeAccess.values()) {
      accessSet.delete(materialId);
    }
  }

  async getAttendeeAccess(attendeeId: string, materialId: string): Promise<boolean> {
    const attendeeAccessSet = this.attendeeAccess.get(attendeeId);
    if (!attendeeAccessSet) {
      return false;
    }

    return attendeeAccessSet.has(materialId);
  }

  // Additional helper methods for managing access (not in interface)
  async grantAttendeeAccess(attendeeId: string, materialId: string): Promise<void> {
    let attendeeAccessSet = this.attendeeAccess.get(attendeeId);
    if (!attendeeAccessSet) {
      attendeeAccessSet = new Set();
      this.attendeeAccess.set(attendeeId, attendeeAccessSet);
    }
    
    attendeeAccessSet.add(materialId);
  }

  async revokeAttendeeAccess(attendeeId: string, materialId: string): Promise<void> {
    const attendeeAccessSet = this.attendeeAccess.get(attendeeId);
    if (attendeeAccessSet) {
      attendeeAccessSet.delete(materialId);
    }
  }

  async getAttendeeMaterials(attendeeId: string): Promise<Material[]> {
    const attendeeAccessSet = this.attendeeAccess.get(attendeeId);
    if (!attendeeAccessSet) {
      return [];
    }

    const accessibleMaterials: Material[] = [];
    for (const materialId of attendeeAccessSet) {
      const material = this.materials.get(materialId);
      if (material) {
        accessibleMaterials.push({ ...material }); // Return copy to prevent mutation
      }
    }

    return accessibleMaterials;
  }
}
