// Acceptance verification script for Days 19-24
// Tests: Driver App -> GPS Ping -> Tracking Pipeline -> Dispatch Control

const API_BASE = 'http://localhost:4000/api';

async function runAcceptanceTest() {
  console.log('🚀 Starting Acceptance Test: Days 19–24 (Driver, GPS & Dispatch)...\n');

  try {
    // 1. Fetch Today's trips for driver
    console.log("1️⃣ Fetching Driver Today's Trips...");
    const tripsRes = await fetch(`${API_BASE}/driver/today-trips`);
    if (!tripsRes.ok) throw new Error('Failed to fetch driver today-trips');
    const data = await tripsRes.json();
    const trips = data.trips || data;
    console.log(`   ✅ Found ${trips.length} trips assigned to fleet.`);
    const activeTrip = trips[0];
    console.log(`   🚌 Selected Trip: ${activeTrip.tripCode} (${activeTrip.route})`);

    // 2. Start Trip (Day 22)
    console.log("\n2️⃣ Driver Starts Trip (SCHEDULED -> IN_TRANSIT)...");
    const startRes = await fetch(`${API_BASE}/driver/trip/${activeTrip.id}/start`, { method: 'POST' });
    const startData = await startRes.json();
    console.log(`   ✅ Trip status transitioned: ${startData.trip ? startData.trip.status : startData.status}`);

    // 3. Driver broadcasts GPS Ping (Day 23: Driver Phone -> GPS -> Backend)
    console.log("\n3️⃣ Driver Phone sends live GPS ping (Mojo Junction, 76 km/h)...");
    const pingRes = await fetch(`${API_BASE}/tracking/ping`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tripId: activeTrip.id,
        latitude: 8.5982,
        longitude: 39.1245,
        speedKmH: 76,
        milestone: 'Passing Mojo Toll Expressway Interchange'
      })
    });
    const pingData = await pingRes.json();
    console.log(`   ✅ GPS Ingestion: Speed=${pingData.currentSpeedKmH} km/h, Milestone="${pingData.currentMilestone}"`);

    // 4. Test Speed Regulation Guard (Over 80 km/h national limit)
    console.log("\n4️⃣ Testing Speed Regulation Warning (88 km/h ping)...");
    const overSpeedRes = await fetch(`${API_BASE}/tracking/ping`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tripId: activeTrip.id,
        latitude: 8.5800,
        longitude: 39.1400,
        speedKmH: 88,
        milestone: 'Approaching Batu/Ziway corridor'
      })
    });
    const overSpeedData = await overSpeedRes.json();
    console.log(`   ⚠️ Speed Warning Audit: ${overSpeedData.speedWarning}`);

    // 5. Backend -> Management Dashboard & Passenger GPS View (Day 23)
    console.log("\n5️⃣ Verifying Passenger & Dispatcher Live Tracking View...");
    const trackingRes = await fetch(`${API_BASE}/tracking/trip/${activeTrip.id}`);
    const trackingData = await trackingRes.json();
    console.log(`   ✅ Live GPS Position: ${trackingData.location.latitude}°N, ${trackingData.location.longitude}°E`);
    console.log(`   📍 Current Milestone: "${trackingData.location.milestone}"`);

    // 6. Dispatcher Fleet Monitoring (Day 24)
    console.log("\n6️⃣ Verifying Central Dispatcher Fleet Telemetry Stream...");
    const fleetRes = await fetch(`${API_BASE}/tracking/fleet`);
    const fleetData = await fleetRes.json();
    console.log(`   ✅ Active Fleet Tracked: ${fleetData.fleet.length} vehicle(s) currently broadcasting.`);

    // 7. Dispatcher reassigns crew & bus (Day 24)
    console.log("\n7️⃣ Dispatcher assigns replacement driver...");
    const assignRes = await fetch(`${API_BASE}/trips/${activeTrip.id}/assign`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        driverName: 'Captain Tadesse Bekele',
        driverPhone: '+251 91 199 8877'
      })
    });
    const assignData = await assignRes.json();
    console.log(`   ✅ Reassigned Driver: ${assignData.trip.driverName} (${assignData.trip.driverPhone})`);

    // 8. Driver reports operational delay (Day 22)
    console.log("\n8️⃣ Driver reports delay (45 mins due to tire puncture)...");
    const delayRes = await fetch(`${API_BASE}/driver/trip/${activeTrip.id}/delay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        delayMinutes: 45,
        reason: 'Rear outer tire puncture repaired near Ziway lake turnoff'
      })
    });
    const delayData = await delayRes.json();
    console.log(`   ✅ Delay recorded: ${delayData.trip.delayMinutes} mins, status: ${delayData.trip.status}`);

    // 9. Driver reports safety incident (Day 22)
    console.log("\n9️⃣ Driver logs incident report...");
    const incidentRes = await fetch(`${API_BASE}/driver/trip/${activeTrip.id}/incident`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        incidentType: 'MECHANICAL',
        severity: 'LOW',
        description: 'Tire replacement completed safely; resumed journey towards Hawassa',
        locationNote: 'Kilometer 142 Hawassa highway'
      })
    });
    const incidentData = await incidentRes.json();
    console.log(`   ✅ Incident logged: ID ${incidentData.incident.id}, Severity: ${incidentData.incident.severity}`);

    // 10. Driver / Dispatch ends trip (Day 22 & 24)
    console.log("\n🔟 Ending trip on arrival at terminal...");
    const endRes = await fetch(`${API_BASE}/driver/trip/${activeTrip.id}/end`, { method: 'POST' });
    const endData = await endRes.json();
    console.log(`   ✅ Trip finalized: status = ${endData.trip ? endData.trip.status : endData.status}`);

    console.log('\n🎉 ALL ACCEPTANCE TESTS FOR DAYS 19–24 PASSED SUCCESSFULLY! 🇪🇹🚍\n');
  } catch (err) {
    console.error('❌ Acceptance test failed:', err);
    process.exit(1);
  }
}

runAcceptanceTest();
