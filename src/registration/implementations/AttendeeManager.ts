/**
 * AttendeeManager - Concrete Implementation
 * Manages attendee registration and updates
 * Simple, focused implementation - no over-engineering!
 */

import type { IAttendeeManager } from '../core/interfaces/index.js';
import type { Attendee, AttendeeInfo, AttendeeUpdates } from '../core/types/index.js';

export class AttendeeManager implements IAttendeeManager {
  private attendees: Map<string, Attendee> = new Map();
  private bookingAttendees: Map<string, string[]> = new Map(); // bookingId -> attendeeIds
  private nextAttendeeId = 1;

  async addAttendee(bookingId: string, attendeeInfo: AttendeeInfo): Promise<void> {
    const attendeeId = `attendee-${this.nextAttendeeId++}`;
    
    const attendee: Attendee = {
      // AttendeeInfo properties
      firstName: attendeeInfo.firstName,
      lastName: attendeeInfo.lastName,
      email: attendeeInfo.email,
      phone: attendeeInfo.phone || '',
      company: attendeeInfo.company || '',
      dietaryRestrictions: attendeeInfo.dietaryRestrictions || '',
      accessibilityNeeds: attendeeInfo.accessibilityNeeds || '',
      // Additional Attendee properties
      id: attendeeId,
      bookingId,
      accessStatus: {
        attendeeId,
        hasAccess: false,
        passwordGenerated: false
      },
      registrationDate: new Date()
    };

    // Store attendee
    this.attendees.set(attendeeId, attendee);

    // Update booking -> attendees mapping
    const existingAttendees = this.bookingAttendees.get(bookingId) || [];
    existingAttendees.push(attendeeId);
    this.bookingAttendees.set(bookingId, existingAttendees);
  }

  async getAttendees(bookingId: string): Promise<Attendee[]> {
    const attendeeIds = this.bookingAttendees.get(bookingId) || [];
    const attendees: Attendee[] = [];

    for (const attendeeId of attendeeIds) {
      const attendee = this.attendees.get(attendeeId);
      if (attendee) {
        attendees.push({ ...attendee }); // Return copy to prevent mutation
      }
    }

    return attendees;
  }

  async removeAttendee(attendeeId: string): Promise<void> {
    const attendee = this.attendees.get(attendeeId);
    if (!attendee) {
      throw new Error(`Attendee not found: ${attendeeId}`);
    }

    const bookingId = attendee.bookingId;

    // Remove from attendees map
    this.attendees.delete(attendeeId);

    // Remove from booking -> attendees mapping
    const attendeeIds = this.bookingAttendees.get(bookingId) || [];
    const updatedIds = attendeeIds.filter(id => id !== attendeeId);
    this.bookingAttendees.set(bookingId, updatedIds);
  }

  async updateAttendee(attendeeId: string, updates: AttendeeUpdates): Promise<void> {
    const attendee = this.attendees.get(attendeeId);
    if (!attendee) {
      throw new Error(`Attendee not found: ${attendeeId}`);
    }

    // Apply updates
    if (updates.firstName !== undefined) attendee.firstName = updates.firstName;
    if (updates.lastName !== undefined) attendee.lastName = updates.lastName;
    if (updates.email !== undefined) attendee.email = updates.email;
    if (updates.phone !== undefined) attendee.phone = updates.phone;
    if (updates.company !== undefined) attendee.company = updates.company;
    if (updates.dietaryRestrictions !== undefined) attendee.dietaryRestrictions = updates.dietaryRestrictions;
    if (updates.accessibilityNeeds !== undefined) attendee.accessibilityNeeds = updates.accessibilityNeeds;

    // Update stored attendee
    this.attendees.set(attendeeId, attendee);
  }
}
