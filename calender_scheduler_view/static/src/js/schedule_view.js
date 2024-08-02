/* global py */
/* Odoo web_timeline
 * Copyright 2015 ACSONE SA/NV
 * Copyright 2016 Pedro M. Baeza <pedro.baeza@tecnativa.com>
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

odoo.define("calender_scheduler_view.View", function (require) {
    "use strict";

    const core = require("web.core");
    const utils = require("web.utils");
    const view_registry = require("web.view_registry");
    const CalendarView = require("web.CalendarView");
    const ScheduleRenderer = require("calender_scheduler_view.Renderer");
    const ScheduleController = require("calender_scheduler_view.Controller");
    const ScheduleModel = require("calender_scheduler_view.model");
    

    const _lt = core._lt;

    function isNullOrUndef(value) {
        return _.isUndefined(value) || _.isNull(value);
    }
    const scalesInfo = {
        day: 'resourceTimeGridDay',
        week: 'timeGridWeek',
        month: 'dayGridMonth',
        year: 'dayGridYear',
        // resource: 'resourceTimeGridDay',
    };
    var ScheduleView = CalendarView.extend({
        display_name: _lt("Schedule"),
        icon: "fa-tasks",
        config: _.extend({}, CalendarView.prototype.config, {
            Controller: ScheduleController,
            Renderer: ScheduleRenderer,
            Model: ScheduleModel,
        }),
        viewType: 'scheduleview',
        jsLibs: [
            '/web/static/lib/fullcalendar/core/main.js',
            '/web/static/lib/fullcalendar/interaction/main.js',
            '/web/static/lib/fullcalendar/moment/main.js',
            '/web/static/lib/fullcalendar/daygrid/main.js',
            '/web/static/lib/fullcalendar/timegrid/main.js',
            '/web/static/lib/fullcalendar/list/main.js',
            '/calender_scheduler_view/static/src/js/fullcalendar/resource-common/main.js',
            '/calender_scheduler_view/static/src/js/fullcalendar/resource-daygrid/main.js',
            '/calender_scheduler_view/static/src/js/fullcalendar/resource-timegrid/main.js'
        ],
        init: function (viewInfo, params) {
            this._super.apply(this, arguments);
            var arch = this.arch;
            var attrs = arch.attrs;
            this.loadParams.second_model = attrs.second_model || 'res.partner';
            this.loadParams.second_displayfield = attrs.second_displayfield || 'name';
            this.loadParams.model_default_field = attrs.model_default_field || 'partner_id';
            this.loadParams.scalesInfo = scalesInfo;

            this.rendererParams.second_model = attrs.second_model || 'res.partner';
            this.rendererParams.second_displayfield = attrs.second_displayfield || 'name';
            this.rendererParams.model_default_field = attrs.model_default_field || 'partner_id';
            this.rendererParams.scalesInfo = scalesInfo;

            this.controllerParams.second_model = attrs.second_model || 'res.partner';
            this.controllerParams.second_displayfield = attrs.second_displayfield || 'name';
            this.controllerParams.model_default_field = attrs.model_default_field || 'partner_id';



        },
    });

    view_registry.add("scheduleview", ScheduleView);
    return ScheduleView;
});
