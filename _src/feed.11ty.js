import { ICalCalendar, ICalAlarmType, ICalCalendarMethod } from 'ical-generator';
import calendar from './_data/calendar.json' with { type: 'json' };
import { berlinIsoDateTime } from '../lib/time.js';

export default class FeedTemplate {
  // Setup Eleventy data for this template,
  // namely set the name of the file to be generated
  data() {
    return {
      permalink: calendar.permalink,
    }
  }

  // The render method is called
  render({ meetings }) {
    // Generate a calendar object based on the calendar configuration
    // plus information provided by eleventy
    const startTime = '19:00';
    const endTime = '23:00';
    const cal = new ICalCalendar({
      name: calendar.title,
      description: calendar.description,
      prodId: {
        company: calendar.organisation,
        product: 'WHIP Leipzig',
      },
      url: calendar.url + this.page.url,
      method: ICalCalendarMethod.PUBLISH,
    })

    // Events are given as absolute UTC instants (see berlinIsoDateTime), not as
    // "19:00 in whichever zone the calendar declares" — ical-generator resolves the
    // latter using the *build machine's own* local time zone, not the named one, which
    // silently produced wrong times whenever CI (UTC) and a contributor's laptop
    // (Europe/Berlin) disagreed. Plain UTC timestamps have no such ambiguity.

    // Loop through of each of our events using the collection
    for (const meeting of meetings) {
      // Create a calendar event from each page
      const event = cal.createEvent({
        id: `${meeting.type.toUpperCase()}-${meeting.date}`,
        start: berlinIsoDateTime(meeting.date, startTime),
        end: berlinIsoDateTime(meeting.date, endTime),
        summary: meeting.type === "meeting" ? "WHIP-Stammtisch" : "Play-WHIP",
        description: meeting.topic ? `Thema: ${meeting.topic}` : ""
      })

      // Add an alert to the event
      const alarm = new Date(berlinIsoDateTime(meeting.date, startTime));
      alarm.setMinutes(alarm.getMinutes() - 120); // 2 hours before the event
      event.createAlarm({
        type: ICalAlarmType.display,
        trigger: alarm,
      });
    }

    // Generate the ical file and return it for Eleventy
    return cal.toString()
  }
}