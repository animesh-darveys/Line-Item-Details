import '@shopify/ui-extensions/preact';
import {render} from 'preact';
import {useEffect, useState} from 'preact/hooks';

export default async () => {
  render(<OrderStatusPage />, document.body);
};

function OrderStatusPage() {
  const [items, setItems] = useState([]);
  const [orderId, setOrderId] = useState('');

  useEffect(() => {
    const getValue = (metafields = []) => {
      const field = metafields.find(
        (item) =>
          item?.metafield?.namespace === 'custom' &&
          item?.metafield?.key === 'line_item_details'
      );

      try {
        const parsed = JSON.parse(field?.metafield?.value || '{}');

        setItems(parsed?.line_items || []);
        setOrderId(parsed?.order_id || getOrderIdFromUrl());
      } catch {
        setItems([]);
        setOrderId(getOrderIdFromUrl());
      }
    };

    getValue(shopify.appMetafields?.current || shopify.appMetafields || []);

    const unsubscribe = shopify.appMetafields?.subscribe?.((metafields) => {
      getValue(metafields);
    });

    return () => unsubscribe?.();
  }, []);

  return (
    <s-page heading="Order Tracking">
      <s-section heading={`Order #${orderId || '-'}`}>
        <s-stack gap="base">
          {!items.length && (
            <s-banner>
              <s-text>No item details found</s-text>
            </s-banner>
          )}

          {items.map((item) => (
            <s-box
              key={item.line_item_id}
              border="base"
              borderRadius="base"
              padding="base"
            >
              <s-stack gap="base">
                {item.image_url && (
                  <s-image
                    src={item.image_url}
                    alt={item.product_title}
                    inlineSize="90px"
                  />
                )}

                <s-text emphasis="bold">{item.product_title}</s-text>
                <s-text>SKU: {item.sku || '-'}</s-text>
                <s-text>Total Qty: {item.total_qty || 0}</s-text>

                {item.tag_lines && <s-text>{item.tag_lines}</s-text>}

                {item.qty_statuses?.map((qty, index) => {
                  const activeStatus = qty.status?.find(
                    (status) => Number(status.value) === 1
                  );

                  return (
                    <s-box
                      key={`${item.line_item_id}-${index}`}
                      padding="base"
                      border="base"
                      borderRadius="base"
                    >
                      <s-stack gap="small">
                        <s-text emphasis="bold">
                          Shipment {index + 1} - Qty: {qty.unit || 0}
                        </s-text>

                        <s-badge
                          tone={
                            activeStatus?.name?.includes('Delivered')
                              ? 'success'
                              : 'info'
                          }
                        >
                          {activeStatus?.name || 'No status'}
                        </s-badge>

                        <s-text>
                          {qty.status
                            ?.map((step) =>
                              Number(step.value) === 1
                                ? `✅ ${step.name}`
                                : `○ ${step.name}`
                            )
                            .join('  →  ')}
                        </s-text>

                        {qty.tracking && (
                          <s-box
                            padding="base"
                            border="base"
                            borderRadius="base"
                          >
                            <s-stack gap="small">
                              <s-text emphasis="bold">
                                Tracking Information
                              </s-text>
                              <s-text>
                                Courier: {qty.tracking.courier || '-'}
                              </s-text>
                              <s-text>
                                AWB: {qty.tracking.awb || '-'}
                              </s-text>

                              {qty.tracking.url && (
                                <s-link href={qty.tracking.url}>
                                  Track Shipment
                                </s-link>
                              )}
                            </s-stack>
                          </s-box>
                        )}
                      </s-stack>
                    </s-box>
                  );
                })}
              </s-stack>
            </s-box>
          ))}
        </s-stack>
      </s-section>
    </s-page>
  );
}

function getOrderIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('orderId') || '';
}