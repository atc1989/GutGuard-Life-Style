# First session after register

Register used to copy the new name onto the Maria Santos demo (₱1,750, four invites, 10 days left, BASE 2/5). That was a lie.

## Day zero

1. `/register` writes an empty member session: 0 points, no invites, no bottle. If the email or mobile already exists in Supabase, registration returns a field error instead of a second card.
2. `/card` is the product — their name, tap to flip, **Show this at the door**. Primary CTA **Go to my dashboard** opens `/app/health`. **How points work** is secondary.
3. `/nearly` is a legend: ₱0, empty invites. Primary CTA **Start my Lifestyle Protocol** opens `/app/health` so the screen is never a dead end. **Back to my card** remains as a secondary path.
4. `/app/health` stays empty until a bottle exists. A mock order grants 30 days per bottle and opens the calendar.

Sign-in resumes by phase: members land on `/app/health`; everyone else on the door.

## Sign out

**Sign out** is a bordered, full-width control on the door, Nearly Free, and Settings. It clears the mock `localStorage` session and the Supabase cookie, then returns to `/`.

## Demo

The bottom phase jumper still loads Maria Santos when you jump to claimed / nearly / member.
