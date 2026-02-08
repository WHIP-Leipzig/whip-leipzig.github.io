import { ICalCalendar, ICalAlarmType, ICalCalendarMethod } from 'ical-generator';
import { tzlib_get_ical_block } from 'timezones-ical-library';
import calendar from './_data/calendar.json' with { type: 'json' };

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
    
    cal.timezone({
      name: 'Europe/Berlin',
      generator: (tz) => tzlib_get_ical_block(tz)[0],
    });

    // Loop through of each of our events using the collection
    for (const meeting of meetings) {
      // Create a calendar event from each page
      const event = cal.createEvent({
        id: `${meeting.type.toUpperCase()}-${meeting.date}`,
        start: `${meeting.date}T${startTime}Z`,
        end: `${meeting.date}T${endTime}Z`,
        summary: meeting.type === "meeting" ? "WHIP-Stammtisch" : "Play-WHIP",
        description: meeting.topic ? `Thema: ${meeting.topic}` : ""
      })

      // Add an alert to the event
      const alarm = new Date(`${meeting.date}T${startTime}Z`);
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