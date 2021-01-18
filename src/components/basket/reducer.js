import produce from 'immer';

export const initialState = {
  status: 'not-hydrated',
  /**
   * A simplistic baskeet which gets stored on client side
   * Each client cart item consists of these fields:
   *  - sku
   *  - path
   *  - priceVariantIdentifier
   *  - quantity
   */
  clientBasket: { cart: [], voucherCode: null },

  // The validated basket sent back from the Service API
  serverBasket: null,

  // The basket cart item to draw attention to
  attentionCartItem: {}
};

export default produce(function reducer(draft, { action, ...rest }) {
  /**
   * This flag helps keeping track of if the incoming
   * change is triggered by _this_ browser tab or a
   * different browser tab
   */
  draft.changeTriggeredByOtherTab = false;

  switch (action) {
    case 'hydrate': {
      if (draft.status === 'not-hydrated') {
        if (rest.cart) {
          draft.clientBasket = rest || initialState.clientBasket;

          if (!draft.clientBasket.cart) {
            draft.clientBasket.cart = initialState.clientBasket.cart;
          }
        }
        draft.status = 'server-state-is-stale';
      }
      break;
    }

    case 'channel-update': {
      draft.clientBasket = rest.clientBasket;
      draft.serverBasket = rest.serverBasket;
      draft.changeTriggeredByOtherTab = true;
      draft.status = 'ready';
      break;
    }

    case 'empty': {
      draft.clientBasket = initialState.clientBasket;
      draft.status = 'server-state-is-stale';
      break;
    }

    case 'add-item':
    case 'remove-item':
    case 'increment-item':
    case 'decrement-item': {
      const { sku, path, priceVariantIdentifier = 'default' } = rest;

      if (!sku || !path) {
        throw new Error(`Please provide "sku" and "path" for ${action}`);
      }

      const itemIndex = draft.clientBasket.cart.findIndex((i) => i.sku === sku);

      if (itemIndex !== -1) {
        if (action === 'remove-item') {
          draft.clientBasket.cart.splice(itemIndex, 1);
        } else {
          const item = draft.clientBasket.cart[itemIndex];

          if (action === 'decrement-item') {
            item.quantity -= 1;
          } else {
            item.quantity += 1;
          }
        }
      } else {
        if (!['remove-item', 'decrement-item'].includes(action)) {
          draft.clientBasket.cart.push({
            sku,
            path,
            priceVariantIdentifier,
            quantity: 1
          });
        }
      }

      draft.status = 'server-state-is-stale';

      break;
    }

    case 'set-server-state': {
      draft.serverBasket = rest.serverBasket;
      draft.status = 'ready';
      break;
    }

    case 'draw-attention': {
      draft.attentionCartItem = {
        time: Date.now(),
        sku: rest.sku
      };
      break;
    }

    default: {
      throw new Error(`Action ${action} not supported`);
    }
  }

  // A cart item is only valid if we have path and sku
  if (draft.clientBasket.cart.length > 0) {
    draft.clientBasket.cart = draft.clientBasket.cart.filter(
      function validateCartItem({ path, sku }) {
        return path && sku;
      }
    );
  }
});
