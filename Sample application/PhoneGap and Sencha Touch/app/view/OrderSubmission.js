Ext.define("MobiPrint.view.OrderSubmission", {
    extend: "Ext.Panel",
    xtype: "mobiprint-ordersubmission",
    id: "order-submission",
    requires: ["Ext.field.Search", "Ext.form.FieldSet", "Ext.field.Password", "Ext.field.Text"],
    config: {
        layout: "vbox",
        // Seems like this can't be changed later for the "current order" view, probably because it's the first view
        // in the NavigationView and it is never popped.
        title: _("SUBMIT_CURRENT_ORDER"),

        scrollable: true,
        padding: ".6em .8em",

        items: [{
            xtype: "label",
           // docked: "top"
        }, {
            xtype: "panel",
            layout: "vbox",

            items: {
                xtype: "fieldset",
                items: {
                    xtype: "searchfield"
                }
            }
        }, {
            xtype: "list",
            scrollable: false,
            padding: "0 0 1.3em 0",
            store: "Locations",
            ui: "round",
            itemTpl: "<strong>{name}</strong><br/>{address}"
        }, {
            xtype: "panel",
            layout: "vbox",

            items: {
                xtype: "fieldset",
                items: [{
                    xtype: "textfield",
                    label: _("USERNAME_COLON")
                }, {
                    xtype: "passwordfield",
                    label: _("PASSWORD_COLON")
                }, {
                    xtype: "checkboxfield",
                    label: _("CONFIRM_ORDER"),
                    labelWidth: "80%"
                }]
            }
        }, {
            xtype: "button",
            ui: "confirm",
            id: "submit-order-button",
            text: _("SUBMIT")
        }],
    },

    setNumPictures: function(numPictures) {
        this.down("label").setHtml(Ext.String.format(_("SUBMISSION_TEXT_FMT"), numPictures))
    }
})
