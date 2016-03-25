describe("Advanced Preferences", function () {
	describe("Files & Folders", function () {
		describe("Linked Attachment Base Directory", function () {
			var setBaseDirectory = Zotero.Promise.coroutine(function* (basePath) {
				var win = yield loadWindow("chrome://zotero/content/preferences/preferences.xul", {
					pane: 'zotero-prefpane-advanced',
					tabIndex: 1
				});
				
				// Wait for tab to load
				var doc = win.document;
				var prefwindow = doc.documentElement;
				var defer = Zotero.Promise.defer();
				var pane = doc.getElementById('zotero-prefpane-advanced');
				if (!pane.loaded) {
					pane.addEventListener('paneload', function () {
						defer.resolve();
					})
					yield defer.promise;
				}
				
				var promise = waitForDialog();
				yield win.Zotero_Preferences.Attachment_Base_Directory.changePath(basePath);
				yield promise;
				
				win.close();
			});
			
			var clearBaseDirectory = Zotero.Promise.coroutine(function* (basePath) {
				var win = yield loadWindow("chrome://zotero/content/preferences/preferences.xul", {
					pane: 'zotero-prefpane-advanced',
					tabIndex: 1
				});
				
				// Wait for tab to load
				var doc = win.document;
				var prefwindow = doc.documentElement;
				var defer = Zotero.Promise.defer();
				var pane = doc.getElementById('zotero-prefpane-advanced');
				if (!pane.loaded) {
					pane.addEventListener('paneload', function () {
						defer.resolve();
					})
					yield defer.promise;
				}
				
				var promise = waitForDialog();
				yield win.Zotero_Preferences.Attachment_Base_Directory.clearPath();
				yield promise;
				
				win.close();
			});
			
			beforeEach(function () {
				Zotero.Prefs.clear('baseAttachmentPath');
				Zotero.Prefs.clear('saveRelativeAttachmentPath');
			});
			
			it("should set new base directory", function* () {
				var basePath = getTestDataDirectory().path;
				yield setBaseDirectory(basePath);
				assert.equal(Zotero.Prefs.get('baseAttachmentPath'), basePath);
				assert.isTrue(Zotero.Prefs.get('saveRelativeAttachmentPath'));
			})
			
			it("should clear base directory", function* () {
				var basePath = getTestDataDirectory().path;
				yield setBaseDirectory(basePath);
				yield clearBaseDirectory();
				
				assert.equal(Zotero.Prefs.get('baseAttachmentPath'), '');
				assert.isFalse(Zotero.Prefs.get('saveRelativeAttachmentPath'));
			})
			
			it("should change absolute path of linked attachment under new base dir to prefixed path", function* () {
				var file = getTestDataDirectory();
				file.append('test.png');
				var attachment = yield Zotero.Attachments.linkFromFile({ file });
				assert.equal(attachment.attachmentPath, file.path);
				
				var basePath = getTestDataDirectory().path;
				yield setBaseDirectory(basePath);
				
				assert.equal(
					attachment.attachmentPath,
					Zotero.Attachments.BASE_PATH_PLACEHOLDER + 'test.png'
				);
			})
			
			it("should change prefixed path to absolute when changing base directory", function* () {
				var basePath = getTestDataDirectory().path;
				yield setBaseDirectory(basePath);
				
				var file = getTestDataDirectory();
				file.append('test.png');
				var attachment = yield Zotero.Attachments.linkFromFile({ file });
				assert.equal(
					attachment.attachmentPath,
					Zotero.Attachments.BASE_PATH_PLACEHOLDER + 'test.png'
				);
				
				var basePath = Zotero.getTempDirectory().path;
				yield setBaseDirectory(basePath);
				
				assert.equal(attachment.attachmentPath, file.path);
			})
			
			it("should change prefixed path to absolute when clearing base directory", function* () {
				var basePath = getTestDataDirectory().path;
				yield setBaseDirectory(basePath);
				
				var file = getTestDataDirectory();
				file.append('test.png');
				var attachment = yield Zotero.Attachments.linkFromFile({ file });
				assert.equal(
					attachment.attachmentPath,
					Zotero.Attachments.BASE_PATH_PLACEHOLDER + 'test.png'
				);
				
				yield clearBaseDirectory();
				
				assert.equal(Zotero.Prefs.get('baseAttachmentPath'), '');
				assert.isFalse(Zotero.Prefs.get('saveRelativeAttachmentPath'));
				
				assert.equal(attachment.attachmentPath, file.path);
			})
		})
	})
})