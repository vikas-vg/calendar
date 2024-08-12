from odoo import fields, models

TIMELINE_VIEW = ("scheduleview", "ScheduleCalender")


class IrUIView(models.Model):
    _inherit = "ir.ui.view"

    type = fields.Selection(selection_add=[TIMELINE_VIEW], ondelete={'scheduleview': 'cascade'})


class ActionView(models.Model):
    _inherit = "ir.actions.act_window.view"

    view_mode = fields.Selection(selection_add=[TIMELINE_VIEW], ondelete={'scheduleview': 'cascade'})
