import apiFactory from "../api";

export const downloadFileOrPhoto = async (event, { url, originalName }) => {
    event.preventDefault();
    try {
        const response = await apiFactory.resourceApi.getFile(url);

        const blob = new Blob([response.data], {
            type: response.headers["content-type"],
        });
        const urlDownload = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = urlDownload;
        link.download = originalName;

        document.body.appendChild(link);
        link.click();

        // Clean up and revoke the object URL
        document.body.removeChild(link);
        window.URL.revokeObjectURL(urlDownload);
    } catch (error) {
        console.error("There was an error downloading the file:", error);
    }
};

