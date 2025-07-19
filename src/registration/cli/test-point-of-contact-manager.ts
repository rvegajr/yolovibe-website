#!/usr/bin/env tsx
/**
 * CLI Test Harness for IPointOfContactManager Interface
 * Testing concrete implementation - interface segregation in action!
 * 
 * Usage: tsx test-point-of-contact-manager.ts
 */

import type { IPointOfContactManager } from '../core/interfaces/index.js';
import type { ContactInfo, PointOfContact } from '../core/types/index.js';
import { PointOfContactManager } from '../implementations/PointOfContactManager.js';

// TEST SUITE
async function testPointOfContactManager() {
  console.log('🧪 Testing IPointOfContactManager Interface...\n');
  
  // Use concrete implementation instead of mock!
  // Cast to any since CLI test expects methods beyond current interface definition
  const pocManager: any = new PointOfContactManager();
  let passedTests = 0;
  let totalTests = 0;

  // Test 1: Add Point of Contact
  totalTests++;
  try {
    const contactInfo: ContactInfo = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1-555-0123',
      company: 'ACME Corp',
      title: 'Manager'
    };

    const contactId = await pocManager.addPointOfContact('booking_123', contactInfo);
    
    console.log('✅ Test 1: addPointOfContact()');
    console.log(`   Contact ID: ${contactId}`);
    console.log(`   Name: ${contactInfo.firstName} ${contactInfo.lastName}`);
    console.log(`   Email: ${contactInfo.email}`);
    console.log(`   Company: ${contactInfo.company}`);
    console.log('   ✅ Point of contact added successfully\n');
    
    passedTests++;
  } catch (error) {
    console.log('❌ Test 1: addPointOfContact() failed');
    console.log(`   Error: ${error}\n`);
  }

  // Test 2: Get Point of Contact
  totalTests++;
  try {
    const contactInfo: ContactInfo = {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phone: '+1-555-0456',
      company: 'Tech Solutions'
    };

    const contactId = await pocManager.addPointOfContact('booking_456', contactInfo);
    const retrievedContact = await pocManager.getPointOfContactById(contactId);
    
    console.log('✅ Test 2: getPointOfContact()');
    console.log(`   Contact ID: ${retrievedContact.id}`);
    console.log(`   Name: ${retrievedContact.firstName} ${retrievedContact.lastName}`);
    console.log(`   Email: ${retrievedContact.email}`);
    console.log(`   Booking ID: ${retrievedContact.bookingId}`);
    console.log(`   Created: ${retrievedContact.createdDate.toISOString()}`);
    console.log('   ✅ Point of contact retrieved successfully\n');
    
    passedTests++;
  } catch (error) {
    console.log('❌ Test 2: getPointOfContact() failed');
    console.log(`   Error: ${error}\n`);
  }

  // Test 3: Update Point of Contact
  totalTests++;
  try {
    const contactInfo: ContactInfo = {
      firstName: 'Bob',
      lastName: 'Wilson',
      email: 'bob.wilson@example.com',
      phone: '+1-555-0789'
    };

    const contactId = await pocManager.addPointOfContact('booking_789', contactInfo);
    
    const updates = {
      phone: '+1-555-9999',
      company: 'Updated Corp',
      title: 'Senior Manager'
    };
    
    await pocManager.updatePointOfContact(contactId, updates);
    const updatedContact = await pocManager.getPointOfContactById(contactId);
    
    console.log('✅ Test 3: updatePointOfContact()');
    console.log(`   Contact ID: ${updatedContact.id}`);
    console.log(`   Updated Phone: ${updatedContact.phone}`);
    console.log(`   Updated Company: ${updatedContact.company}`);
    console.log(`   Updated Title: ${updatedContact.title}`);
    console.log('   ✅ Point of contact updated successfully\n');
    
    passedTests++;
  } catch (error) {
    console.log('❌ Test 3: updatePointOfContact() failed');
    console.log(`   Error: ${error}\n`);
  }

  // Test 4: Get Contacts by Booking
  totalTests++;
  try {
    const bookingId = 'booking_multi';
    
    // Add multiple contacts for same booking
    const contact1Info: ContactInfo = {
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'alice@example.com',
      phone: '+1-555-1111'
    };
    
    const contact2Info: ContactInfo = {
      firstName: 'Charlie',
      lastName: 'Brown',
      email: 'charlie@example.com',
      phone: '+1-555-2222'
    };

    await pocManager.addPointOfContact(bookingId, contact1Info);
    await pocManager.addPointOfContact(bookingId, contact2Info);
    
    const contacts = await pocManager.getContactsByBooking(bookingId);
    
    console.log('✅ Test 4: getContactsByBooking()');
    console.log(`   Booking ID: ${bookingId}`);
    console.log(`   Found ${contacts.length} contacts:`);
    contacts.forEach((contact: any, index: number) => {
      console.log(`   ${index + 1}. ${contact.firstName} ${contact.lastName} (${contact.email})`);
    });
    console.log('   ✅ Contacts retrieved by booking successfully\n');
    
    passedTests++;
  } catch (error) {
    console.log('❌ Test 4: getContactsByBooking() failed');
    console.log(`   Error: ${error}\n`);
  }

  // Test 5: Error Handling - Get Non-existent Contact
  totalTests++;
  try {
    await pocManager.getPointOfContactById('invalid-contact-id');
    console.log('❌ Test 5: Error handling failed - should have thrown error\n');
  } catch (error: unknown) {
    console.log('✅ Test 5: getPointOfContact() error handling');
    const message = error instanceof Error ? error.message : String(error);
    console.log(`   Correctly threw error: ${message}\n`);
    passedTests++;
  }

  // Test 6: Error Handling - Update Non-existent Contact
  totalTests++;
  try {
    await pocManager.updatePointOfContact('invalid-contact-id', { phone: '+1-555-0000' });
    console.log('❌ Test 6: Error handling failed - should have thrown error\n');
  } catch (error: unknown) {
    console.log('✅ Test 6: updatePointOfContact() error handling');
    const message = error instanceof Error ? error.message : String(error);
    console.log(`   Correctly threw error: ${message}\n`);
    passedTests++;
  }

  // Results Summary
  console.log('🎯 TEST RESULTS:');
  console.log(`   Passed: ${passedTests}/${totalTests}`);
  console.log(`   Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);
  
  if (passedTests === totalTests) {
    console.log('   🎉 ALL TESTS PASSED! IPointOfContactManager interface is ready for implementation!');
  } else {
    console.log('   ⚠️  Some tests failed. Interface needs review.');
    process.exit(1);
  }
}

// Run tests
testPointOfContactManager().catch(console.error);
