import '@shopify/ui-extensions/preact';
import {render} from 'preact';
import {useEffect, useState} from 'preact/hooks';

export default async () => {
  render(<Extension />, document.body);
};

function Extension() {
  const [items, setItems] = useState([]);

  const orderLines = shopify.lines?.value || [];

  const getMatchedLine = (item) => {
    return orderLines.find((line) => {
      return (
        String(line.id) === String(item.line_item_id) ||
        String(line.merchandise?.id) === String(item.variant_id) ||
        String(line.merchandise?.sku) === String(item.sku)
      );
    });
  };

  const getLineItemDetails = (item, itemIndex) => {
    const matchedLine = getMatchedLine(item);
    const fallbackLine = orderLines[itemIndex];

    const line = matchedLine || fallbackLine;

    return {
      title:
        line?.merchandise?.title ||
        line?.merchandise?.product?.title ||
        item.product_title ||
        '',

      sku:
        line?.merchandise?.sku ||
        item.sku ||
        '',

      qty:
        line?.quantity ||
        item.total_qty ||
        '',

      image:
        line?.merchandise?.image?.url ||
        item.image_url ||
        '',
    };
  };

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
      heading={`Track your order (${items.length} ${
        items.length === 1 ? 'item' : 'items'
      })`}
    >
      <s-stack gap="base">
        {items.map((item, itemIndex) => {
          const details = getLineItemDetails(item, itemIndex);

          return (
            <s-box
              key={item.line_item_id || itemIndex}
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
                    {details.image && (
                      <s-image
                        borderWidth="base"
                        borderRadius="base"
                        aspectRatio={1}
                        fit="cover"
                        inlineSize="66px"
                        src={details.image}
                        alt={details.title}
                      />
                    )}
                  </s-grid-item>

                  <s-grid-item>
                    <s-stack>
                      <s-text type="strong">{details.title}</s-text>

                      <s-text>
                        SKU: {details.sku}
                      </s-text>

                      <s-text>
                        Total Qty: {details.qty}
                      </s-text>
                    </s-stack>
                  </s-grid-item>
                </s-grid>

                <s-divider />

                {item.qty_statuses?.map((shipment, shipmentIndex) => {
                  const activeIndex =
                    shipment.status?.findIndex(
                      (status) => status.value === 1
                    ) ?? -1;

                  const activeStatus =
                    activeIndex >= 0 ? shipment.status[activeIndex] : null;

                  return (
                    <s-box key={`${item.line_item_id}-${shipmentIndex}`}>
                      <s-stack gap="small">
                        <s-text>
                          Shipment {shipmentIndex + 1} • Qty: {shipment.unit}
                        </s-text>

                        <s-badge tone="neutral">
                          {activeStatus?.name || 'Pending'}
                        </s-badge>

                        <s-stack gap="small">
                          {shipment.status?.map((step, stepIndex) => (
                            <s-text key={stepIndex}>
                              {stepIndex <= activeIndex ? '✅' : '⬜'}{' '}
                              {step.name}
                            </s-text>
                          ))}
                        </s-stack>
                      </s-stack>
                    </s-box>
                  );
                })}
              </s-stack>
            </s-box>
          );
        })}
      </s-stack>
    </s-section>
  );
}