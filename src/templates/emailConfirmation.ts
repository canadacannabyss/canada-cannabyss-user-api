export default (url: string) => `
  <div style='width: 100%; height: 100%; background-color: #fff'>
    <div style='width: 90%; display: table; margin: 30px auto 0 auto'>
      <div style='display: flex; flex-direction: row'>
        <img 
          src='https://canada-cannabyss.s3.ca-central-1.amazonaws.com/assets/logo/canada-cannabyss-logo.png'
          alt='Canada Cannabyss logo'
          title='Canada Cannabyss'
          style='height: 60px; width: 60px;'
        />
        <h1 style='color: #18840f; font-weight: 100; margin-left: 5px;'>Canada Cannabyss</h1>
      </div>
      <br />
      <p style='color: #1b1b1b; font-size: 16px; margin-bottom: 0.5rem;'>Verify your account by clicking on the link below:</p>
      <a href='${url}' target='_blank' style='color: #18840f; font-size: 16px; text-decoration: none; line-height: 1.5; word-break: break-all;'>${url}</a>
      <p style='color: #1b1b1b; font-size: 16px;'>Enjoy!</p>
      <br />
      <p style='color: #1b1b1b; font-size: 13px;'>With 💚 Canada Cannabyss Team</p>
    </div>
  </div>
`
