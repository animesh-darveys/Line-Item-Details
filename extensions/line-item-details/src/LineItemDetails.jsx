import '@shopify/ui-extensions/preact';
import { render } from 'preact';
import { useEffect, useState } from 'preact/hooks';

export default async () => {
  render(<Extension />, document.body);
};

function Extension() {
  const [items, setItems] = useState([]);

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
      } catch {
        setItems([]);
      }
    };

    getValue(shopify.appMetafields?.current || shopify.appMetafields || []);

    const unsubscribe = shopify.appMetafields?.subscribe?.((metafields) => {
      getValue(metafields);
    });

    return () => unsubscribe?.();
  }, []);

  if (!items.length) {
    return (
      <s-section heading="Track your order">
        <s-banner>
          <s-text>No item details found</s-text>
        </s-banner>
      </s-section>
    );
  }

  return (
    <s-section
      heading={`Track your order (${items.length} ${items.length === 1 ? 'item' : 'items'
        })`}
    >
      <s-stack gap="base">
        {items.map((item) => (
          <s-box
            key={item.line_item_id}
            border="base"
            borderRadius="base"
            padding="base"
          >
            <s-stack gap="base">
              <s-grid
                accessibilityLabel="Product listing"
                gridTemplateColumns="66px 1fr"
                gap="base"
              >
                <s-grid-item>
                  {item.image_url && (
                    <s-image
                    borderWidth="base"
                    borderRadius="base"
                    aspectRatio="1 / 1"
                      src={item.image_url}
                      alt={item.product_title}
                    />
                  )}
                  
                </s-grid-item>

                <s-grid-item>
                  <s-stack gap="small">
                    <s-text>
                      {item.product_title}
                    </s-text>

                    <s-text>
                      <s-text>SKU:</s-text> {item.sku}
                    </s-text>

                    <s-text>
                      <s-text>Total Qty:</s-text> {item.total_qty}
                    </s-text>
                  </s-stack>
                </s-grid-item>
              </s-grid>

              {/* {item.tag_lines && (
                <s-text appearance="subdued">
                  {item.tag_lines}
                </s-text>
              )} */}

              {item.qty_statuses?.map((shipment, shipmentIndex) => {
                const activeIndex = shipment.status?.findIndex(
                  (status) => status.value === 1
                );

                const activeStatus =
                  activeIndex >= 0
                    ? shipment.status[activeIndex]
                    : null;

                return (
                  <s-box
                    key={`${item.line_item_id}-${shipmentIndex}`}
                    border="base"
                    borderRadius="base"
                    padding="base"
                  >
                    <s-stack gap="small">
                      <s-text>
                        Shipment {shipmentIndex + 1} • Qty:{' '}
                        {shipment.unit}
                      </s-text>

                      <s-badge
                        tone={
                          activeStatus?.name?.includes('Delivered')
                            ? 'success'
                            : 'info'
                        }
                      >
                        {activeStatus?.name || 'Pending'}
                      </s-badge>

                      <s-stack gap="extra-tight">
                        {shipment.status?.map((step, stepIndex) => (
                          <s-text key={stepIndex}>
                            {stepIndex <= activeIndex ? '✅' : '⬜'} {step.name}
                          </s-text>
                        ))}
                      </s-stack>
                    </s-stack>
                  </s-box>
                );
              })}
            </s-stack>
          </s-box>
        ))}
      </s-stack>
    </s-section>
  );
}