// Automated Concurrency Acceptance Test Suite
// Verifies: Two or more users attempting to hold or purchase the same seat simultaneously
// Expectation: Exactly 1 succeeds, all others receive 409 Conflict (Double Booking Prevented)

async function runConcurrencyTest() {
  console.log('===============================================================');
  console.log('🧪 RUNNING CRITICAL ACCEPTANCE TEST: SEAT CONCURRENCY & LOCKING');
  console.log('===============================================================\n');

  const API_BASE = 'http://localhost:4000/api';

  // 1. Fetch active trip
  console.log('1️⃣ Fetching scheduled trip...');
  const tripsRes = await fetch(`${API_BASE}/trips`);
  const trips = await tripsRes.json();
  if (trips.length === 0) {
    throw new Error('No trips found in database to run concurrency test.');
  }

  const targetTrip = trips[0];
  const targetSeat = '5A';
  console.log(`🎯 Target Trip: ${targetTrip.tripCode} (${targetTrip.route.originStation.city} ➔ ${targetTrip.route.destinationStation.city})`);
  console.log(`💺 Target Contested Seat: "${targetSeat}"\n`);

  // Release any existing lock on target seat first
  await fetch(`${API_BASE}/bookings/release-seat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tripId: targetTrip.id, seatNumbers: [targetSeat] })
  });

  // 2. Fire 5 simultaneous hold requests targeting seat '5A' at the exact same millisecond
  console.log('2️⃣ Firing 5 SIMULTANEOUS concurrent seat hold requests for Seat 5A...');
  const userSessions = [
    { id: 'session_user_alpha', name: 'User Alpha (Kality App)' },
    { id: 'session_user_beta', name: 'User Beta (Autobis Tera POS)' },
    { id: 'session_user_gamma', name: 'User Gamma (Telebirr Web)' },
    { id: 'session_user_delta', name: 'User Delta (CBE Birr)' },
    { id: 'session_user_epsilon', name: 'User Epsilon (Phone Agent)' }
  ];

  const startTime = Date.now();
  const promises = userSessions.map(user => {
    return fetch(`${API_BASE}/bookings/hold-seat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tripId: targetTrip.id,
        seatNumbers: [targetSeat],
        sessionId: user.id
      })
    }).then(async res => {
      const data = await res.json();
      return {
        user: user.name,
        status: res.status,
        data
      };
    });
  });

  const results = await Promise.all(promises);
  const durationMs = Date.now() - startTime;

  console.log(`⏱️ All 5 requests completed in ${durationMs}ms.\n`);

  // 3. Analyze results
  const successfulHolds = results.filter(r => r.status === 200);
  const conflictedHolds = results.filter(r => r.status === 409);

  console.log('📊 CONCURRENCY RESULTS BREAKDOWN:');
  results.forEach(r => {
    if (r.status === 200) {
      console.log(`   🟢 [${r.status} OK] ${r.user} -> WINNER! Lock acquired (${r.data.message})`);
    } else {
      console.log(`   🔴 [${r.status} CONFLICT] ${r.user} -> REJECTED: ${r.data.error}`);
    }
  });

  console.log('\n---------------------------------------------------------------');
  console.log(`Successful Locks Granted: ${successfulHolds.length} (Expected: 1)`);
  console.log(`Conflicts Blocked:        ${conflictedHolds.length} (Expected: 4)`);

  if (successfulHolds.length === 1 && conflictedHolds.length === 4) {
    console.log('✅ PASS: Exactly ONE user won the seat lock. Double booking was 100% prevented!');
  } else {
    console.error('❌ FAIL: Concurrency violation detected!');
    process.exit(1);
  }

  // 4. Test State Transition: HELD -> PAID
  console.log('\n3️⃣ Testing State Transition: HELD ➔ PAID (Checkout winning user)...');
  const winningSession = successfulHolds[0];
  const checkoutRes = await fetch(`${API_BASE}/bookings/online-checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tripId: targetTrip.id,
      customerName: winningSession.user,
      customerPhone: '+251 91 199 0011',
      paymentMethod: 'TELEBIRR',
      passengers: [{
        seatNumber: targetSeat,
        passengerName: 'Alemayehu Tadesse',
        passengerPhone: '+251 91 199 0011',
        passengerIdNumber: 'ETH-PASS-9912'
      }]
    })
  });

  const checkoutData = await checkoutRes.json();
  if (checkoutRes.status === 201) {
    console.log(`✅ PASS: Ticket successfully issued! Ticket: ${checkoutData.tickets[0].ticketNumber}, Status: ${checkoutData.status}`);
  } else {
    console.error('❌ FAIL: Checkout failed:', checkoutData);
    process.exit(1);
  }

  // 5. Test double booking after ticket is PAID
  console.log('\n4️⃣ Testing Double Booking Prevention on PAID seat: User Beta tries to buy already PAID seat 5A...');
  const secondCheckoutRes = await fetch(`${API_BASE}/bookings/online-checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tripId: targetTrip.id,
      customerName: 'User Beta',
      customerPhone: '+251 92 222 3344',
      paymentMethod: 'CASH',
      passengers: [{
        seatNumber: targetSeat,
        passengerName: 'Intruder Passenger',
        passengerPhone: '+251 92 222 3344',
        passengerIdNumber: 'FAKE-ID'
      }]
    })
  });

  const secondCheckoutData = await secondCheckoutRes.json();
  if (secondCheckoutRes.status === 409) {
    console.log(`✅ PASS: [409 Conflict] Attempt correctly blocked: "${secondCheckoutData.error}"`);
  } else {
    console.error('❌ FAIL: Double booking permitted!', secondCheckoutData);
    process.exit(1);
  }

  // 6. Test Lifecycle: CANCELLED -> AVAILABLE
  console.log('\n5️⃣ Testing Lifecycle: CANCELLED ➔ AVAILABLE...');
  const cancelRes = await fetch(`${API_BASE}/bookings/${checkoutData.bookingReference}/cancel`, {
    method: 'POST'
  });
  const cancelData = await cancelRes.json();
  console.log(`ℹ️ Cancellation result: ${cancelData.message}`);

  // Now verify that seat 5A can be held again
  const reHoldRes = await fetch(`${API_BASE}/bookings/hold-seat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tripId: targetTrip.id,
      seatNumbers: [targetSeat],
      sessionId: 'session_new_customer'
    })
  });
  const reHoldData = await reHoldRes.json();
  if (reHoldRes.status === 200) {
    console.log(`✅ PASS: Seat 5A transitioned from CANCELLED ➔ AVAILABLE and was successfully reserved by a new passenger!`);
  } else {
    console.error('❌ FAIL: Seat was not released after cancellation:', reHoldData);
    process.exit(1);
  }

  console.log('\n===============================================================');
  console.log('🎉 ALL ACCEPTANCE CRITERIA FOR DAYS 10-12 PASSED WITH 100% SUCCESS!');
  console.log('===============================================================\n');
}

runConcurrencyTest().catch(err => {
  console.error('💥 Test suite error:', err);
  process.exit(1);
});
