import '@shopify/ui-extensions/preact';
import {render} from 'preact';
import {useEffect, useState} from 'preact/hooks';

export default async () => {
  render(<Extension />, document.body);
};

function Extension() {
  const [orderStatus, setOrderStatus] = useState('Loading...');

  useEffect(() => {
    const getValue = (metafields = []) => {
      const field = metafields.find(
        (item) =>
          item?.metafield?.namespace === 'custom' &&
          item?.metafield?.key === 'order_status'
      );

      setOrderStatus(field?.metafield?.value || 'No order status found');
    };

    getValue(shopify.appMetafields?.current || shopify.appMetafields || []);

    const unsubscribe = shopify.appMetafields?.subscribe?.((metafields) => {
      getValue(metafields);
    });

    return () => unsubscribe?.();
  }, []);

  return (
    <s-banner heading="Order Status" tone="success">
      <s-text tone="success" type="strong">{orderStatus}</s-text>
    </s-banner>
  );
}