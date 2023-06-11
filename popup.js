document.addEventListener('DOMContentLoaded', function() {
  var scrapeButton = document.getElementById('scrapeButton');
  scrapeButton.addEventListener('click', scrapePage);
});

function scrapePage() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    var tab = tabs[0];
    var tabName = tab.title;
    chrome.scripting.executeScript(
      {
        target: { tabId: tab.id },
        function: scrapeContent,
      },
      function(results) {
        var pageContent = results[0].result;
        downloadPage(tabName, pageContent);
      }
    );
  });
}

function scrapeContent() {
  var html = document.documentElement.outerHTML;

  var stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
  stylesheets.forEach(function(stylesheet) {
    var href = stylesheet.getAttribute('href');
    var absoluteUrl = new URL(href, document.baseURI).href;
    html += '<style>\n';
    html += '@import url("' + absoluteUrl + '");\n';
    html += '</style>\n';
  });

  var images = document.querySelectorAll('img');
  images.forEach(function(image) {
    var src = image.getAttribute('src');
    var absoluteUrl = new URL(src, document.baseURI).href;
    html += '<img src="' + absoluteUrl + '">\n';
  });

  return html;
}


function downloadPage(tabName, pageContent) {
  var blob = new Blob([pageContent], { type: 'text/html' });
  var url = URL.createObjectURL(blob);
  var filename = tabName.replace(/[/\\?%*:|"<>]/g, '-') + '.html';

  chrome.downloads.download({
    url: url,
    filename: filename,
    saveAs: true,
  });
}
