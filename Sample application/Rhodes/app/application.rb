require 'rho/rhoapplication'

class AppApplication < Rho::RhoApplication
  def initialize
    # Super must be called after settings @tabs!
    @tabs = [
      {:label => Localization::Views[:old_orders], :action => '/app/Order', :icon => '/public/images/tabs/old-orders-tab.png'},
      {:label => Localization::Views[:add_pictures],  :action => '/app/Order/add_pictures', :icon => '/public/images/tabs/add-pictures-tab.png'},
      {:label => Localization::Views[:current_order], :action => '/app/Order/current', :icon => '/public/images/tabs/current-order-tab.png'}
    ]

    # Remove default toolbar
    @@toolbar = nil
    super

    # Uncomment to set sync notification callback to /app/Settings/sync_notify.
    # SyncEngine::set_objectnotify_url("/app/Settings/sync_notify")
    SyncEngine.set_notification(-1, "/app/Settings/sync_notify", '')
  end
end
