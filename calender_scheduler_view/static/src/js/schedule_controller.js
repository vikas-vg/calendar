odoo.define("calender_scheduler_view.Controller", function (require) {
    "use strict";

    const CalendarController = require("web.CalendarController");
    const dialogs = require("web.view_dialogs");
    const core = require("web.core");
    const time = require("web.time");
    const Dialog = require("web.Dialog");
    var QuickCreate = require('web.CalendarQuickCreate');


    const _t = core._t;

    function dateToServer (date, fieldType) {
        date = date.clone().locale('en');
        if (fieldType === "date") {
            return date.local().format('YYYY-MM-DD');
        }
        return date.utc().format('YYYY-MM-DD HH:mm:ss');
    }

    const scheduleController = CalendarController.extend({
        init: function (parent, model, renderer, params) {
            this.second_model = params.second_model
            this.second_displayfield = params.second_displayfield
            this.model_default_field = params.model_default_field
            return this._super.apply(this, arguments);
        },
        _onOpenCreate: function (event) {
            var self = this;
            if (["year", "month"].includes(this.model.get().scale)) {
                event.data.allDay = true;
            }
            var data = this.model.calendarEventToRecord(event.data);
    
            var context = _.extend({}, this.context, event.options && event.options.context);
            // context default has more priority in default_get so if data.name is false then it may
            // lead to error/warning while saving record in form view as name field can be required
            if (data.name) {
                context.default_name = data.name;
            }
            context['default_' + this.mapping.date_start] = data[this.mapping.date_start] || null;
            if (this.mapping.date_stop) {
                context['default_' + this.mapping.date_stop] = data[this.mapping.date_stop] || null;
            }
            if (this.mapping.date_delay) {
                context['default_' + this.mapping.date_delay] = data[this.mapping.date_delay] || null;
            }
            if (this.mapping.all_day) {
                context['default_' + this.mapping.all_day] = data[this.mapping.all_day] || null;
            }
            if (this.mapping.all_day) {
                context['default_' + this.mapping.all_day] = data[this.mapping.all_day] || null;
            }
            if (event.data[this.model_default_field]) {
                context['default_' + this.model_default_field] = event.data[this.model_default_field];
            }
                
            for (var k in context) {
                if (context[k] && context[k]._isAMomentObject) {
                    context[k] = dateToServer(context[k]);
                }
            }
    
            var options = _.extend({}, this.options, event.options, {
                context: context,
                title: this._setEventTitle()
            });
    
            if (this.quick != null) {
                this.quick.destroy();
                this.quick = null;
            }
    
            if (!options.disableQuickCreate && !event.data.disableQuickCreate && this.quickAddPop) {
                this.quick = new QuickCreate(this, true, options, data, event.data);
                this.quick.open();
                this.quick.opened(function () {
                    self.quick.focus();
                });
                return;
            }
    
            if (this.eventOpenPopup) {
                if (this.previousOpen) { this.previousOpen.close(); }
                this.previousOpen = new dialogs.FormViewDialog(self, {
                    res_model: this.modelName,
                    context: context,
                    title: options.title,
                    view_id: this.formViewId || false,
                    disable_multiple_selection: true,
                    on_saved: function () {
                        if (event.data.on_save) {
                            event.data.on_save();
                        }
                        self.reload();
                    },
                });
                this.previousOpen.on('closed', this, () => {
                    if (event.data.on_close) {
                        event.data.on_close();
                    }
                })
                this.previousOpen.open();
            } else {
                this.do_action({
                    type: 'ir.actions.act_window',
                    res_model: this.modelName,
                    views: [[this.formViewId || false, 'form']],
                    target: 'current',
                    context: context,
                });
            }
        },
    });

    return scheduleController;
});
