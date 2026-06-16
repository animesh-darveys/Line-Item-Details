import '@shopify/ui-extensions/preact';
import {render} from 'preact';

export default async () => {
  render(<ProfileBlock />, document.body);
};

function ProfileBlock() {
  return (
    <s-section>
      <s-link href="extension:order-status-page">
        View Order Status Page
      </s-link>
    </s-section>
  );
}