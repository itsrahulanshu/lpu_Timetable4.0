/**
 * Timetable Service
 * Handles fetching and parsing timetable data from UMS
 * Extracted and modernized from old timetable.js
 */

const axios = require('axios');
const cheerio = require('cheerio');
const https = require('https');
const { config } = require('../config/env');

class TimetableService {
  constructor(authService) {
    this.authService = authService;
    this.httpsAgent = new https.Agent({
      rejectUnauthorized: false
    });

    // Course data mapping (can be expanded)
    this.COURSE_DATA = [
      { CourseCode: 'CAP100M', CourseName: 'PROGRAMME ORIENTATION' },
      { CourseCode: 'CAP443', CourseName: 'LINUX AND SHELL SCRIPTING - LAB' },
      { CourseCode: 'CAP455', CourseName: 'OBJECT ORIENTED PROGRAMMING USING C++' },
      { CourseCode: 'CAP476', CourseName: 'DATA COMMUNICATION AND NETWORKING' },
      { CourseCode: 'CAP478', CourseName: 'DATA COMMUNICATION AND NETWORKING-LABORATORY' },
      { CourseCode: 'CAP570', CourseName: 'ADVANCED DATABASE TECHNIQUES' },
      { CourseCode: 'CAP598', CourseName: 'SOFTWARE ENGINEERING AND PROJECT MANAGEMENT' },
      { CourseCode: 'PEA515', CourseName: 'ANALYTICAL SKILLS-I' },
      { CourseCode: 'PEL544', CourseName: 'CORPORATE COMMUNICATION SKILLS' },
      { CourseCode: 'PETV67', CourseName: 'BUILDING WEALTH' }
    ];
  }

  /**
   * Get course name from course code
   */
  getCourseName(courseCode) {
    const course = this.COURSE_DATA.find((c) => c.CourseCode === courseCode);
    return course ? course.CourseName : courseCode;
  }

  /**
   * Parse class description to extract metadata
   */
  parseClassDescription(description) {
    const info = {
      type: 'Lecture',
      course: 'Unknown',
      courseName: 'Unknown Course',
      room: null,
      building: null,
      roomNumber: null,
      group: null,
      section: null
    };

    // Extract type
    if (description.includes('Practical')) {
      info.type = 'Practical';
    } else if (description.includes('Tutorial')) {
      info.type = 'Tutorial';
    }

    // Extract course code
    const courseMatch = description.match(/C:([A-Z0-9]+)/);
    if (courseMatch) {
      info.course = courseMatch[1];
      info.courseName = this.getCourseName(courseMatch[1]);
    }

    // Extract room
    const roomMatch = description.match(/R:\s*([^\\r\\/]+)/);
    if (roomMatch) {
      info.room = roomMatch[1].trim();

      // Parse building and room number (e.g., "26-602D")
      const buildingRoomMatch = info.room.match(/(\d+)-(\d+)\s*([A-Za-z])?/);
      if (buildingRoomMatch) {
        info.building = buildingRoomMatch[1];
        info.roomNumber =
          buildingRoomMatch[2] + (buildingRoomMatch[3] ? buildingRoomMatch[3].toUpperCase() : '');
      } else if (info.room.includes('-')) {
        const parts = info.room.split('-');
        info.building = parts[0];
        info.roomNumber = parts[1].replace(/\s+/g, '');
      } else {
        info.building = '';
        info.roomNumber = info.room;
      }
    }

    // Extract group
    const groupMatch = description.match(/G:(\d+|All)/i);
    if (groupMatch) {
      info.group = groupMatch[1];
    }

    // Extract section
    const sectionMatch = description.match(/S:([A-Z0-9]+)/);
    if (sectionMatch) {
      info.section = sectionMatch[1];
    }

    return info;
  }

  /**
   * Parse time range (e.g., "09-10 AM" → { start: 540, end: 600 })
   */
  parseTimeRange(timeStr) {
    const [timeRange, period] = timeStr.split(' ');
    const [startHour, endHour] = timeRange.split('-').map((h) => parseInt(h));

    let start = startHour;
    let end = endHour;

    // Convert to 24-hour format
    if (period === 'PM') {
      if (start !== 12) start += 12;
      if (end !== 12) end += 12;
      if (end <= start) end = start + 1;
    } else if (period === 'AM') {
      if (start === 12) start = 0;
      if (end === 12) {
        end = 12;
      } else if (end < start) {
        end += 12;
      }
    }

    return {
      start: start * 60, // Convert to minutes
      end: end * 60
    };
  }

  /**
   * Process class item with parsed data
   */
  processClassItem(classItem) {
    const parsedInfo = this.parseClassDescription(classItem.Description);
    const timeRange = this.parseTimeRange(classItem.AttendanceTime);

    return {
      ...classItem,
      Building: parsedInfo.building,
      RoomNumber: parsedInfo.roomNumber,
      Room: parsedInfo.room,
      parsedInfo,
      timeRange
    };
  }

  /**
   * Parse HTML timetable response
   */
  parseTimetableHTML(htmlContent) {
    const $ = cheerio.load(htmlContent);
    const timetableData = [];

    $('.w-schedule__day').each((dayIndex, dayElement) => {
      const dayName = $(dayElement).find('.w-schedule__col-label').text().trim();

      $(dayElement)
        .find('.w-schedule__event-wrapper')
        .each((eventIndex, eventElement) => {
          const $event = $(eventElement);
          const title = $event.attr('title');
          const $link = $event.find('a');
          const onclick = $link.attr('onclick');

          if (title && onclick) {
            // Extract time from onclick
            const timeMatch = onclick.match(/"(\d{2}:\d{2}-\d{2}:\d{2})"/);
            const timeStr = timeMatch ? timeMatch[1] : '';

            const classInfo = this.parseClassDescription(title);

            // Convert time format
            let attendanceTime = '';
            if (timeStr && timeStr.includes('-')) {
              const [startTime, endTime] = timeStr.split('-');
              const startHour = parseInt(startTime.split(':')[0]);
              const endHour = parseInt(endTime.split(':')[0]);

              if (!isNaN(startHour) && !isNaN(endHour)) {
                if (startHour < 12) {
                  attendanceTime = `${startHour}-${endHour} AM`;
                } else if (startHour === 12) {
                  attendanceTime = `${startHour}-${endHour} PM`;
                } else {
                  attendanceTime = `${startHour - 12}-${endHour - 12} PM`;
                }
              } else {
                attendanceTime = '09-10 AM';
              }
            } else {
              attendanceTime = '09-10 AM';
            }

            timetableData.push({
              Description: title,
              AttendanceTime: attendanceTime,
              Day: dayName,
              CourseCode: classInfo.course,
              CourseName: classInfo.courseName,
              Room: classInfo.room,
              Building: classInfo.building,
              RoomNumber: classInfo.roomNumber,
              Group: classInfo.group,
              Section: classInfo.section,
              Type: classInfo.type
            });
          }
        });
    });

    return timetableData;
  }

  /**
   * Fetch fresh timetable data from UMS
   */
  async fetchTimetable(retryCount = 0) {
    const MAX_RETRIES = config.requests.maxRetries;

    try {
      // Ensure we have a valid session
      if (!this.authService.hasValidSession()) {
        await this.authService.authenticate();
      }


      let response;
      try {
        response = await axios.post(
          config.urls.timetable,
          { TermId: '25261' },
          {
            httpsAgent: this.httpsAgent,
            headers: {
              'User-Agent':
                'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15',
              Accept: 'application/json, text/javascript, */*; q=0.01',
              'Content-Type': 'application/json; charset=UTF-8',
              'X-Requested-With': 'XMLHttpRequest',
              Origin: 'https://ums.lpu.in',
              Referer: 'https://ums.lpu.in/lpuums/frmMyCurrentTimeTable.aspx',
              Cookie: this.authService.getSessionCookies()
            },
            timeout: config.requests.timeout
          }
        );
      } catch (axiosError) {
        // Session expired, re-authenticate
        if (axiosError.response && axiosError.response.status >= 400 && retryCount < MAX_RETRIES) {
          this.authService.clearSession();
          await this.authService.authenticate(true);

          // Retry
          return await this.fetchTimetable(retryCount + 1);
        } else {
          throw new Error(`Request failed: ${axiosError.message}`);
        }
      }

      if (!response.data || !response.data.d) {
        this.authService.clearSession();
        throw new Error('Session expired - empty timetable data');
      }

      // Parse HTML
      const timetableData = this.parseTimetableHTML(response.data.d);

      return timetableData;
    } catch (error) {
      console.error('❌ Error fetching timetable:', error.message);

      // Retry if session expired
      if (error.message.includes('Session expired') && retryCount < MAX_RETRIES) {
        this.authService.clearSession();
        return await this.fetchTimetable(retryCount + 1);
      }

      throw error;
    }
  }
}

module.exports = TimetableService;
