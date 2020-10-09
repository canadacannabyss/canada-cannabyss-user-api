module.exports = (order) => `
  <div style='width: 100%; height: 100%; background-color: #fff'>
    <div style='width: 90%; display: table; margin: 30px auto 0 auto'>
      <div style='display: flex; flex-direction: row'>
        <img 
          src='https://canada-cannabyss.s3.ca-central-1.amazonaws.com/assets/logo/canada-cannabyss-logo.png'
          alt='Canada Cannabyss logo'
          title='Canada Cannabyss'
          style='height: 60px; width: 60px;'
        />
        <h1 style='color: #18840f; font-weight: 100; margin-left: 5px;'>Order Tracking Number | Canada Cannabyss</h1>
      </div>
      <br />
      <br />
      <p style='color: #1b1b1b; font-size: 16px; margin-bottom: 0.5rem;'>Order was successfully placed shipped to you.</p>
      <p style='color: #1b1b1b; font-size: 16px; margin-bottom: 0.5rem;'>You can track out package by following these next steps:</p>
      <ol style='margin: 15px 0'>
        <li style='color: #1b1b1b; font-size: 16px; margin-bottom: 0.5rem;'>Go to <a href='${process.env.FRONTEND_URL}/account/orders' target='_blank' style='color: #18840f; font-size: 18px; text-decoration: none; line-height: 1.5;'>${process.env.FRONTEND_URL}/account/orders'</a></li>
        <li style='color: #1b1b1b; font-size: 16px; margin-bottom: 0.5rem;'>Choose the order you want to track.</li>
        <li style='color: #1b1b1b; font-size: 16px; margin-bottom: 0.5rem;'>Find the <span style='color: #18840f;'>tracking number</span> and <span style='color: #18840f;'>tracking postal service website</span>.</li>
        <li style='color: #1b1b1b; font-size: 16px; margin-bottom: 0.5rem;'>Go to the provided tracking postal service website and paste the tracking number in their tracking form.</li>
      </ol>
      <h2 style='color: #18840f; font-size: 16px; margin-bottom: 0.5rem;'>Order ID</h2>
      <span style='color: #1b1b1b; font-size: 18px; margin-bottom: 0.5rem;'>${order._id}</span>
      <h2 style='color: #18840f; font-size: 16px; margin-bottom: 0.5rem;'>Tracking Number</h2>
      <span style='color: #1b1b1b; font-size: 18px; margin-bottom: 0.5rem;'>${order.tracking.number}</span>
      <h2 style='color: #18840f; font-size: 16px; margin-bottom: 0.5rem;'>Postal Service</h2>
      <span style='color: #1b1b1b; font-size: 18px; margin-bottom: 0.5rem;'>${order.tracking.postalService.name}</span>
      <h2 style='color: #18840f; font-size: 16px; margin-bottom: 0.5rem;'>Postal Service Tracking Website</h2>
      <a href='${order.tracking.postalService.trackingWebsite}' target='_blank' style='color: #18840f; font-size: 18px; text-decoration: none; line-height: 1.5;'>${order.tracking.postalService.trackingWebsite}</a>
      <br />
      <br />
      <p style='color: #1b1b1b; font-size: 13px;'>With ❤️ Canada Cannabyss Team</p>
    </div>
  </div>
`;
