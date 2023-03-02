const { encode } = require('uint8-to-base64');

const figmaId = figma.currentUser.id;

const pluginUi = {
  visible: true,
  width: 300,
  height: 50,
  position: {
    x: figma.viewport.bounds.x,
    y: figma.viewport.bounds.y,
  },
};
figma.clientStorage.deleteAsync('windu');
figma.clientStorage.getAsync('windu').then((t) => {
  if (t?.length === 0 || t?.length === undefined) {
    // token has not already been acquired from auth via windu
    /// show a iframe so we can use window to direct to authorize
    figma.showUI(__html__, {
      visible: false,
    });
    figma.ui.postMessage(figmaId);
    figma.ui.onmessage = (message) => {
      // wait from auth page to send success and then direct to figma app
      if (message.success) {
        figma.showUI(`<script>window.location.href='https://app.windu.io/figma?id=${figmaId}'</script>`, {
          ...pluginUi,
        });
      }
      if (message.save) {
        figma.clientStorage.setAsync('windu', message.value);
      }

      handleMessaging();
    };
  } else {
    figma.showUI(`<script>window.location.href='https://app.windu.io/figma?id=${figmaId}'</script>`, { ...pluginUi });
    handleMessaging();
  }
});

const handleMessaging = () => {
  figma.ui.onmessage = (message) => {
    if (message?.activity?.active) {
      figma.clientStorage.setAsync('active', message?.activity?.active);
      figma.ui.resize(
        message?.activity?.active ? 350 : pluginUi.width,
        figma.currentPage.selection[0] !== undefined ? (message.expand ? 450 : 82) : pluginUi.height
      );
    } else {
      figma.clientStorage.setAsync('active', false);
      figma.ui.resize(
        message?.activity?.active ? 350 : pluginUi.width,
        figma.currentPage.selection[0] !== undefined ? 82 : pluginUi.height
      );
    }

    if (message.addReference) {
      captureImageSelection();
    }
    if (message.handOffModal) {
      figma.ui.resize(
        message?.activity?.active ? 350 : pluginUi.width,
        figma.currentPage.selection[0] !== undefined ? 450 : 400
      );
    }
    handleExpandToggle(message);
  };
};

const handleExpandToggle = (message) => {
  figma.clientStorage.setAsync('expand', message.expand);
  if (message.expand) {
    figma.ui.resize(
      message?.activity?.active ? 350 : pluginUi.width,
      figma.currentPage.selection[0] !== undefined ? 450 : 400
    );
  } else if (message.expand === false) {
    figma.ui.resize(
      message?.activity?.active ? 350 : pluginUi.width,
      figma.currentPage.selection[0] !== undefined ? 82 : 50
    );
  }
};

const captureImageSelection = () => {
  figma.currentPage.selection[0].exportAsync({ format: 'PNG' }).then((d) => {
    figma.ui.postMessage({
      showHandoff: true,
      image: d,
      meta: figma.currentPage.selection[0],
      pluginId: '*',
    });
  });
};

figma.on('selectionchange', async () => {
  const isExpand = await figma.clientStorage.getAsync('expand');
  const isActive = await figma.clientStorage.getAsync('active');

  if (figma.currentPage.selection[0] !== undefined) {
    // populate button state in ui
    figma.ui.postMessage({
      showHandoff: true,
      pluginId: '*',
    });

    figma.ui.resize(isActive ? 350 : pluginUi.width, isExpand ? 450 : 82);
  } else {
    figma.ui.resize(isActive ? 350 : pluginUi.width, isExpand ? 400 : pluginUi.height);
    figma.ui.postMessage({
      showHandoff: false,
      pluginId: '*',
    });
  }
});
