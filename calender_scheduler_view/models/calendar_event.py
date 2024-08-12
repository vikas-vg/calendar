from odoo import models, fields


class CalendarEvent(models.Model):
    _inherit = 'calendar.event'

    custom_partner_id = fields.Many2one('res.partner', string="Partner")
    employee_id = fields.Many2one('hr.employee', string="Employee")
