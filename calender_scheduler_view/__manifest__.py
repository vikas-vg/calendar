# Copyright 2016 ACSONE SA/NV (<http://acsone.eu>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    "name": "Web Schedule",
    "version": "15.0.1.0.0",
    "authon": "Vikas Goyal",
    "category": "web",
    "license": "AGPL-3",
    "depends": ["web", "calendar", "hr"],
    "application": False,
    "installable": True,
    "data" : [
        "views/views.xml"
    ],
    'assets': {
        'web.assets_backend': [
            '/calender_scheduler_view/static/src/js/schedule_model.js',
            '/calender_scheduler_view/static/src/js/schedule_controller.js',
            '/calender_scheduler_view/static/src/js/schedule_controller.js',
            '/calender_scheduler_view/static/src/js/schedule_renderer.js',
            '/calender_scheduler_view/static/src/js/schedule_view.js',
        ]
    },
}
