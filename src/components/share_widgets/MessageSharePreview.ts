export const generateMessageShareHTML = (
  channelName: string,
  messageText: string,
  channelImageUrl: string,
  imageUrls: string[] = []
): string => {
  // Ensure we only take up to 3 images as requested
  const displayImages = imageUrls.slice(0, 3);
  
  const imagesHtml = displayImages.length > 0 
    ? `<div class="images-container">
        ${displayImages.map(img => `<img src="${img}" alt="Message Image" class="msg-image" />`).join('')}
       </div>`
    : '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Message in ${channelName}</title>
    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="Message in ${channelName}" />
    <meta property="og:description" content="${messageText.length > 100 ? messageText.substring(0, 97) + '...' : messageText}" />
    <meta property="og:image" content="${displayImages.length > 0 ? displayImages[0] : channelImageUrl}" />
    <meta property="og:type" content="article" />
    
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Message in ${channelName}" />
    <meta name="twitter:description" content="${messageText.length > 100 ? messageText.substring(0, 97) + '...' : messageText}" />
    <meta name="twitter:image" content="${displayImages.length > 0 ? displayImages[0] : channelImageUrl}" />
    
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: #000;
            color: #fff;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            padding: 20px;
            box-sizing: border-box;
        }
        .card {
            background-color: #1a1a1a;
            border-radius: 16px;
            padding: 24px;
            max-width: 500px;
            width: 100%;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        .header {
            display: flex;
            align-items: center;
            margin-bottom: 16px;
            gap: 12px;
        }
        .avatar {
            width: 48px;
            height: 48px;
            border-radius: 24px;
            object-fit: cover;
        }
        .title {
            font-size: 18px;
            font-weight: 600;
            margin: 0;
        }
        .message-body {
            font-size: 16px;
            line-height: 1.5;
            color: #e0e0e0;
            margin-bottom: 16px;
        }
        .images-container {
            display: flex;
            gap: 8px;
            border-radius: 12px;
            overflow: hidden;
        }
        .msg-image {
            flex: 1;
            height: 150px;
            object-fit: cover;
        }
    </style>
</head>
<body>
    <div class="card">
        <div class="header">
            <img src="${channelImageUrl}" alt="Channel Image" class="avatar" />
            <h1 class="title">${channelName}</h1>
        </div>
        <div class="message-body">
            ${messageText}
        </div>
        ${imagesHtml}
    </div>
</body>
</html>
  `.trim();
};
