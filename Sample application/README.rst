Sample application
==================

This file gives a short description about
- where source files can be found for each framework
- which are the main files for development
- how to deploy an application

Titanium
--------

Installation
~~~~~~~~~~~~

`Titanium Studio <http://preview.appcelerator.com/studio/>`_ (based on Eclipse) includes everything that is necessary for development. The newest Titanium Mobile SDK is automatically downloaded when the Studio is started. Then, the platform-specific settings have to be made, e.g. setting up the Android SDK. See the `wiki <https://wiki.appcelerator.org/display/tis/Getting+Started+with+Titanium+Studio#GettingStartedwithTitaniumStudio-InstallingTitanium>`_.

In case of Java problems, uninstall JDK 1.7+ and install 1.6 instead. Set the environment variable to the JDK path (e.g. ``C:\Program Files\Java\jdk1.6.0_25``).

Development
~~~~~~~~~~~

Source code is in ``Resources/lib`` and mostly ``Resources/ui/common``. The main entry point is ``Resources/app.js``.

Deployment on simulator or device
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Titanium Studio includes run configurations for starting an application on the emulator (e.g. Android AVD) or to install it on a device.

Documentation
~~~~~~~~~~~~~

See `Appcelerator documentation <http://docs.appcelerator.com/>`_.

Rhodes
------

Installation
~~~~~~~~~~~~

The `RhoStudio installer <http://www.rhomobile.com/products/rhostudio/>`_ includes all necessary packages and it is recommended to use exactly these versions. It has to be installed into a path without spaces (e.g. ``C:\dev`` on Windows). After installation, one should execute ``rhodes-setup`` from the command line and set the correct paths for the Java JDK and others.

Note that the installer *pre*\ pends directories to your PATH environment variable.

Rhodes compiles a minimal Ruby interpreter for mobile platforms. For example, the Android NDK is needed for development on Android (must be installed in path without spaces). As soon as you install an app on the Android emulator or a device, Rhodes will compile the necessary libraries (which will take a few minutes). In the beginning, the included RhoSimulator is enough to get started without installing additional development kits.

Development
~~~~~~~~~~~

Source code is in ``app`` (mostly ``app/Order``, ``app/Configuration`` and ``app/helpers``). The main entry point is in ``app/application.rb``.

Deployment on simulator or device
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Open the debug/run configurations in RhoStudio (like you would do in Eclipse) and add a new configuration. Select the right project and the emulator/device type.

Note: For RhoSimulator, there is an option to automatically reload code. This can be useful, although it is not reliable. It reloads Ruby code (and also ERB templates) at each request.

Documentation
~~~~~~~~~~~~~

See `Rhodes documentation <http://docs.rhomobile.com/>`_.