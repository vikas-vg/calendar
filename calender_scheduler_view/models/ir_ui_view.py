# Copyright 2016 ACSONE SA/NV (<http://acsone.eu>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import fields, models

TIMELINE_VIEW = ("scheduleview", "ScheduleCalender")


class IrUIView(models.Model):
    _inherit = "ir.ui.view"

    type = fields.Selection(selection_add=[TIMELINE_VIEW], ondelete={'scheduleview': 'cascade'})


class ASctionView(models.Model):
    _inherit = "ir.actions.act_window.view"

    view_mode = fields.Selection(selection_add=[TIMELINE_VIEW], ondelete={'scheduleview': 'cascade'})


class CalendarEvent(models.Model):

    _inherit = 'calendar.event'

    custom_partner_id = fields.Many2one('res.partner', string="Partner")
    employee_id = fields.Many2one('hr.employee', string="Employee")
