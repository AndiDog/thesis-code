require 'date'
require 'json'
require 'time'

class Configuration
  def self.filename
    if not File.exists?(Rho::RhoApplication::get_app_path('db'))
      Dir.mkdir(Rho::RhoApplication::get_app_path('db'))
    end

    File.join(Rho::RhoApplication::get_app_path('db'), 'configuration.json')
  end

  def self.last_orders_list_update
    cfg = self.read_or_create_config

    if cfg['last_orders_list_update']
      Time.parse(cfg['last_orders_list_update'])
    else
      # Return very old time value
      Time.parse('1990-01-01')
    end
  end

  def self.last_orders_list_update=(val)
    cfg = self.read_or_create_config
    cfg['last_orders_list_update'] = val
    self.write_config(cfg)
  end

  def self.last_picture_scan_update
      cfg = self.read_or_create_config

      if cfg['last_picture_scan_update']
        Time.parse(cfg['last_picture_scan_update'])
      else
        # Return very old time value
        Time.parse('1990-01-01')
      end
    end

    def self.last_picture_scan_update=(val)
      cfg = self.read_or_create_config
      cfg['last_picture_scan_update'] = val
      self.write_config(cfg)
    end

  def self.orders
    cfg = self.read_or_create_config
    cfg['orders'] or []
  end

  def self.orders=(val)
    cfg = self.read_or_create_config
    cfg['orders'] = val
    self.write_config(cfg)
  end

  def self.picture_scan
    cfg = self.read_or_create_config
    cfg['picture_scan'] or []
  end

  def self.picture_scan=(val)
    cfg = self.read_or_create_config
    cfg['picture_scan'] = val
    self.write_config(cfg)
  end

  def self.read_or_create_config
    filename = self.filename

    if not File.exists?(filename)
      f = File.new(filename, 'wb')
      begin
        f.write('{}')
      ensure
        f.close
      end
    end

    f = File.open(filename, 'rb')
    begin
      content = f.read()
    ensure
      f.close()
    end

    return Rho::JSON.parse(content)
  end

  def self.write_config(cfg)
    filename = self.filename
    content = JSON.generate(cfg)
    f = File.new(filename, 'wb')
    begin
      f.write(content)
    ensure
      f.close
    end
  end
end
