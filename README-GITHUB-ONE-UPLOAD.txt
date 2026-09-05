# India F&O Catalyst Monitor — GitHub Pages One-Upload Package

## Android-friendly deployment

1. Create/open your GitHub repository.
2. Upload these two items to the repository root:
   - `India-FNO-Catalyst-Monitor-V730000.zip`
   - `.github/workflows/deploy-pages.yml`
3. Commit to the `main` branch.
4. Go to **Settings → Pages** and select **GitHub Actions** if GitHub asks for a source.
5. Open **Actions** and wait for **Deploy India F&O Catalyst Monitor** to finish.
6. Your site will be available at the repository's GitHub Pages URL.

The workflow extracts the ZIP automatically before deploying, so folders inside the ZIP do not need to be uploaded individually.

Do not rename the ZIP unless you also change the filename in `.github/workflows/deploy-pages.yml`.
