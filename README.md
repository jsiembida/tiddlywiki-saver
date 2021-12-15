
## TiddlyWiki Saver

is a browser extension that provides save and backup functions when you edit local TiddlyWiki
files in the browser. Inspired by [file-backups](https://github.com/pmario/file-backups)
and [savetiddlers](https://github.com/buggyj/savetiddlers).



#### Highlights

* Works with the latest Chrome based browsers. Tested with Chrome v96, Chromium v96 and Edge v96.
Uses Manifest V3 for these.
* Works with the latest Firefox v95. Uses Manifest V2 in this case.
* Tiddlywiki Saver is written in modern, vanilla Javascript that embraces recent APIs.
* Zero external dependencies, not even Node nor NPM are needed to build and use it.
* Configurable, timestamp based backups. You can set up a number of backups as well as a limit on used space.
* Download shelf in Chrome based browsers can be hidden further improving user experience.
* Only TiddlyWiki5 files are supported.



#### Building and installing

Provided build script works on Linux or macOS.

```
git clone git@github.com:jsiembida/tiddlywiki-saver.git
cd tiddlywiki-saver
./build.sh chrome
./build.sh firefox
```

The build artifacts are in the `build` directory.
In Chrome, open [about:extensions](about:extensions), enable the "developer mode" and load
unpacked extension from the `build/chrome` directory.
In Firefox, open [about:debugging](about:debugging), select "this firefox" and load
the temporary add-on manifest from `build/firefox`.
Despite the naming, in both cases the extension gets permanently installed and becomes
immediately usable.


#### Configuration

By default, the extension will keep three most recent backups with no limits regarding the space they use.
This can be changed in the extension / add-on options page in your browser.



#### How to use it

Local TiddlyWiki files open in browser are automatically recognized by the extension and when saved,
instead of the usual download mechanism, the extension will try to save the TiddlyWiki file in place
and also create a backup copy as per configuration.
This mechanism is subject to limitations imposed by the browser security model and only works when
the wiki file is within browser's downloads directory, or in any subdirectory thereof.
Since Chrome and Firefox respect soft links, an example setup could be:

```
mkdir ~/Documents/wiki
mv wiki.html ~/Documents/wiki/index.html
ln -s ~/Documents/wiki ~/Downloads/
```



#### Application mode

Chrome can open local html files in application mode, which allows a much better integration with the desktop.
Please see provided `tiddlywiki.desktop` and `linux-desktop.sh`, they can be used as follows:

```
./linux-desktop-integration.sh ~/Downloads/wiki/index.html
```

In Windows or macOS custom Chrome "shortcuts" can be configured to improve the user experience, too.

Furthermore, to increase isolation, a dedicated Chrome instance can be pointed to a separate user data directory
and have a custom downloads directory configured as needed.
