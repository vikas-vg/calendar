/* global vis, py */
odoo.define("calender_scheduler_view.Renderer", function (require) {
    "use strict";

    const CalendarRenderer = require("web.CalendarRenderer");
    const core = require("web.core");
    const time = require("web.time");
    const { createYearCalendarView } = require('/web/static/src/js/libs/fullcalendar.js');

    var qweb = core.qweb;
    const _t = core._t;

    const ScheduleRenderer = CalendarRenderer.extend({
        init: function (parent, state, params) {
            this.second_model = params.second_model
            this.second_displayfield = params.second_displayfield
            this.model_default_field = params.model_default_field
            return this._super.apply(this, arguments);
        },
        _convertEventToFC3Event: function (fc4Event) {
            var event = fc4Event;
            if (!moment.isMoment(fc4Event.start)) {
                event = {
                    id: fc4Event.id,
                    title: fc4Event.title,
                    start: moment(fc4Event.start).utcOffset(0, true),
                    end: fc4Event.end && moment(fc4Event.end).utcOffset(0, true),
                    allDay: fc4Event.allDay,
                    color: fc4Event.color,
                };
                if (fc4Event[this.model_default_field]){
                    event[this.model_default_field] = fc4Event[this.model_default_field] || null
                }
                if (fc4Event.extendedProps) {
                    event = Object.assign({}, event, {
                        r_start: fc4Event.extendedProps.r_start && moment(fc4Event.extendedProps.r_start).utcOffset(0, true),
                        r_end: fc4Event.extendedProps.r_end && moment(fc4Event.extendedProps.r_end).utcOffset(0, true),
                        record: fc4Event.extendedProps.record,
                        attendees: fc4Event.extendedProps.attendees,
                    });
                    if (fc4Event[this.model_default_field]){
                        event[this.model_default_field] = fc4Event[this.model_default_field] || null
                    }
                }
            }
            try {
                event.newResource = fc4Event.newResource;
            }
            catch (ex){
            }
            return event;
        },
        _getFullCalendarOptions: function (fcOptions) {
            console.log("/////////////////////vfcOptionsfcOptionsfcOptions",fcOptions)
            var self = this;
            const options = Object.assign({}, this.state.fc_options, {
                plugins: [
                    'moment',
                    'interaction',
                    'resourceTimeGrid',
                    'resourceDayGrid',
                ],
                eventDrop: function (eventDropInfo) {
                    eventDropInfo.event.newResource = eventDropInfo.newResource;
                    var event = self._convertEventToFC3Event(eventDropInfo.event);
                    self.trigger_up('dropRecord', event);
                },
                eventResize: function (eventResizeInfo) {
                    self._unselectEvent();
                    var event = self._convertEventToFC3Event(eventResizeInfo.event);
                    self.trigger_up('updateRecord', event);
                },
                eventClick: function (eventClickInfo) {
                    eventClickInfo.jsEvent.preventDefault();
                    eventClickInfo.jsEvent.stopPropagation();
                    var eventData = eventClickInfo.event;
                    self._unselectEvent();
                    $(self.calendarElement).find(self._computeEventSelector(eventClickInfo)).addClass('o_cw_custom_highlight');
                    self._renderEventPopover(eventData, $(eventClickInfo.el));
                },
                selectAllow: function (event) {
                   if (event.end.getDate() === event.start.getDate() || event.allDay) {
                       return true;
                   }
                },
                yearDateClick: function (info) {
                    self._unselectEvent();
                    info.view.unselect();
                    if (!info.events.length) {
                        if (info.selectable) {
                            const data = {
                                start: info.date,
                                allDay: true,
                            };
                            if (self.state.context.default_name) {
                                data.title = self.state.context.default_name;
                            }
                            self.trigger_up('openCreate', self._convertEventToFC3Event(data));
                        }
                    } else {
                        self._renderYearEventPopover(info.date, info.events, $(info.dayEl));
                    }
                },
                select: function (selectionInfo) {
                    // Clicking on the view, dispose any visible popover. Otherwise create a new event.
                    if (self.$('.o_cw_popover').length) {
                        self._unselectEvent();
                    }
                    var data = {start: selectionInfo.start, end: selectionInfo.end, allDay: selectionInfo.allDay};
                    if (self.state.context.default_name) {
                        data.title = self.state.context.default_name;
                    }
                    try {
                        data[self.model_default_field] = parseInt(selectionInfo.resource._resource.id);
                    }
                    catch (ex){}
                    self.trigger_up('openCreate', self._convertEventToFC3Event(data));
                    if (self.state.scale === 'year') {
                        self.calendar.view.unselect();
                    } else {
                        self.calendar.unselect();
                    }
                },
                eventRender: function (info) {
                    var event = info.event;
                    var element = $(info.el);
                    var view = info.view;
                    element.attr('data-event-id', event.id);
                    if (view.type === 'dayGridYear') {
                        const color = this.getColor(event.extendedProps.color_index);
                        if (typeof color === 'string') {
                            element.css({
                                backgroundColor: color,
                            });
                        } else if (typeof color === 'number') {
                            element.addClass(`o_calendar_color_${color}`);
                        } else {
                            element.addClass('o_calendar_color_1');
                        }
                    } else {
                    var $render = $(self._eventRender(event));
                    element.find('.fc-content').html($render.html());
                    element.addClass($render.attr('class'));
    
                    // Add background if doesn't exist
                    if (!element.find('.fc-bg').length) {
                        element.find('.fc-content').after($('<div/>', {class: 'fc-bg'}));
                    }
    
                    if (view.type === 'dayGridMonth' && event.extendedProps.record) {
                        var start = event.extendedProps.r_start || event.start;
                        var end = event.extendedProps.r_end || event.end;
                        // Detect if the event occurs in just one day
                        // note: add & remove 1 min to avoid issues with 00:00
                        var isSameDayEvent = moment(start).clone().add(1, 'minute').isSame(moment(end).clone().subtract(1, 'minute'), 'day');
                        if (!event.extendedProps.record.allday && isSameDayEvent) {
                            // For month view: do not show background for non allday, single day events
                            element.addClass('o_cw_nobg');
                            if (event.extendedProps.showTime && !self.hideTime) {
                                const displayTime = moment(start).clone().format(self._getDbTimeFormat());
                                element.find('.fc-content .fc-time').text(displayTime);
                            }
                        }
                    }
    
                    // On double click, edit the event
                    element.on('dblclick', function () {
                        self.trigger_up('edit_event', {id: event.id});
                    });
                    }
                },
                datesRender: function (info) {
                    const viewToMode = Object.fromEntries(
                        Object.entries(self.scalesInfo).map(([k, v]) => [v, k])
                    );
                    self.trigger_up('viewUpdated', {
                        mode: viewToMode[info.view.type],
                        title: info.view.title,
                    });
                },
                // Add/Remove a class on hover to style multiple days events.
                // The css ":hover" selector can't be used because these events
                // are rendered using multiple elements.
                eventMouseEnter: function (mouseEnterInfo) {
                    $(self.calendarElement).find(self._computeEventSelector(mouseEnterInfo)).addClass('o_cw_custom_hover');
                },
                eventMouseLeave: function (mouseLeaveInfo) {
                    if (!mouseLeaveInfo.event.id) {
                        return;
                    }
                    $(self.calendarElement).find(self._computeEventSelector(mouseLeaveInfo)).removeClass('o_cw_custom_hover');
                },
                eventDragStart: function (mouseDragInfo) {
                    $(self.calendarElement).find(`[data-event-id=${mouseDragInfo.event.id}]`).addClass('o_cw_custom_hover');
                    self._unselectEvent();
                },
                eventResizeStart: function (mouseResizeInfo) {
                    $(self.calendarElement).find(`[data-event-id=${mouseResizeInfo.event.id}]`).addClass('o_cw_custom_hover');
                    self._unselectEvent();
                },
                eventLimitClick: function () {
                    self._unselectEvent();
                    return 'popover';
                },
                windowResize: function () {
                    self._onWindowResize();
                },
                views: {
                    resourceTimeGridDay: {
                        columnHeaderFormat: 'LL'
                    },
                    timeGridWeek: {
                        columnHeaderFormat: 'ddd D'
                    },
                    dayGridMonth: {
                        columnHeaderFormat: 'dddd'
                    }
                },
        
                height: 'parent',
                unselectAuto: false,
                timeGridEventMinHeight: 15,
                dir: _t.database.parameters.direction,
                events: (info, successCB) => {
                    successCB(self.state.data);
                },
            }, fcOptions);
            options.plugins.push(createYearCalendarView(FullCalendar, options));
            return options;
        },
    });

    return ScheduleRenderer;
});
