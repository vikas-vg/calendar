odoo.define("calender_scheduler_view.model", function (require) {
    "use strict";
    const CalendarModel = require("web.CalendarModel");
    var Context = require('web.Context');

    function dateToServer (date) {
        return date.clone().utc().locale('en').format('YYYY-MM-DD HH:mm:ss');
    }
    const scheduleModel = CalendarModel.extend({
        updateRecord: function (record) {
            // Cannot modify actual name yet
            var data = _.omit(this.calendarEventToRecord(record), 'name');
            for (var k in data) {
                if (data[k] && data[k]._isAMomentObject) {
                    data[k] = dateToServer(data[k]);
                }
                if (record.newResource) {
                    data[this.model_default_field] = parseInt(record.newResource._resource.id)
                }
            }
            var context = new Context(this.data.context, { from_ui: true });
            return this._rpc({
                model: this.modelName,
                method: 'write',
                args: [[parseInt(record.id, 10)], data],
                context: context
            });
        },

        _loadCalendar: function () {
            console.log("/d1111111111111111111111111111")
            var self = this;
            this.data.fc_options = this._getFullCalendarOptions();
            var defs = _.map(this.data.filters, this._loadFilter.bind(this));
            // self.scalesInfo.day = 'resourceTimeGridDay';
            self.data.fc_options.resources = this.resources;
            return Promise.all(defs).then(function () {
                return self._rpc({
                    model: self.modelName,
                    method: 'search_read',
                    context: self.data.context,
                    fields: self.fieldNames,
                    domain: self.data.domain.concat(self._getRangeDomain()).concat(self._getFilterDomain())
                })
                    .then(async function (events) {
                        self._parseServerData(events);
                        self.data.data = await self._getCalendarEventData(events);
                        return Promise.all([
                            self._loadColors(self.data, self.data.data),
                            self._loadRecordsToFilters(self.data, self.data.data)
                        ]);
                    });
            });
        },
        _recordToCalendarEvent: function (evt) {
            var date_start;
            var date_stop;
            var date_delay = evt[this.mapping.date_delay] || 1.0,
                all_day = this.fields[this.mapping.date_start].type === 'date' ||
                    this.mapping.all_day && evt[this.mapping.all_day] || false,
                the_title = '',
                attendees = [];
    
            if (!all_day) {
                date_start = evt[this.mapping.date_start].clone();
                date_stop = this.mapping.date_stop ? evt[this.mapping.date_stop].clone() : null;
            } else {
                date_start = evt[this.mapping.date_start].clone().startOf('day');
                date_stop = this.mapping.date_stop ? evt[this.mapping.date_stop].clone().startOf('day') : null;
            }
    
            if (!date_stop && date_delay) {
                date_stop = date_start.clone().add(date_delay,'hours');
            }
    
            if (!all_day) {
                date_start.add(this.getSession().getTZOffset(date_start), 'minutes');
                date_stop.add(this.getSession().getTZOffset(date_stop), 'minutes');
            }
    
            if (this.mapping.all_day && evt[this.mapping.all_day]) {
                date_stop.add(1, 'days');
            }
            var r = {
                'record': evt,
                'start': date_start.local(true).toDate(),
                'end': date_stop.local(true).toDate(),
                'r_start': date_start.clone().local(true).toDate(),
                'r_end': date_stop.clone().local(true).toDate(),
                'title': the_title,
                'allDay': all_day,
                'id': evt.id,
                'attendees':attendees,
                'resourceId': evt[this.model_default_field] ? evt[this.model_default_field][0] : null,
                'resourceName': evt[this.model_default_field] ? evt[this.model_default_field][1] : null,
                'resourceEditable': true,
            };
            console.log("ddddddddddddddddddd",r)
            if (!(this.mapping.all_day && evt[this.mapping.all_day]) && this.data.scale === 'month' && this.fields[this.mapping.date_start].type !== 'date') {
                r.showTime = true;
            }
    
            return r;
        },
        __load: function (params) {
            var self = this;
            this.resources = [];
            const modelname = params.second_model
            const displayfields = params.second_displayfield
            this.second_model = params.second_model
            this.second_displayfield = params.second_displayfield
            this.model_default_field = params.model_default_field
            this._rpc({
                model: modelname,
                method: 'search_read',
                kwargs: {
                    domain: [],
                    fields: [displayfields],
                    limit: 2
                },
            }).then(function (results) {
                console.log("/.dddddddddddddd", results)
                _.each(results, (result) => {
                    self.resources.push({
                        "id": result.id,
                        "title": result[displayfields],
                    });
                })
            });
            return this._super.apply(this, arguments);
        }
    });

    return scheduleModel;
});