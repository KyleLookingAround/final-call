---
type: System
description: Crews that need rest, planes that come back late, and the Maintenance policy that services worn planes.
---
# Airline operations

**Airline operations** (`34-airline-operations.js`).
- A departure of your own plane waits for a rested crew (`crewReady`; a duty of about 10 h, then 12 h of rest), and shows CREW DELAY while it waits.
- `farDelay` can bring a plane back late.
- The Maintenance policy (on by default) services worn planes parked at base at 03:00 (`nightChecks`), and every half hour, on the crews' clock, a plane at a gate worn past 8 flights, at the same price (`turnChecks`), so planes that fly through the night are serviced too. The advisor's service tip shows only while the policy is off (release audit, row 25).
