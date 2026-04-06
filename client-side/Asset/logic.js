document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('file-input');
    const uploadBtn = document.getElementById('upload-btn');
    const filesGrid = document.getElementById('files-grid');

    // Trigger file input when upload button is clicked
    uploadBtn.addEventListener('click', function() {
        fileInput.click();
    });

    // Handle file selection
    fileInput.addEventListener('change', function() {
        filesGrid.innerHTML = ''; // Clear existing files
        Array.from(fileInput.files).forEach(file => {
            const fileItem = createFileItem(file);
            filesGrid.appendChild(fileItem);
        });
    });

    // Function to create file item element
    function createFileItem(file) {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';

        const fileIcon = document.createElement('div');
        fileIcon.className = 'file-icon material-icons';
        fileIcon.textContent = getFileIcon(file.type);

        const fileName = document.createElement('div');
        fileName.className = 'file-name';
        fileName.textContent = file.name;

        fileItem.appendChild(fileIcon);
        fileItem.appendChild(fileName);

        // Add click event to simulate opening file
        fileItem.addEventListener('click', function() {
            alert(`Opening ${file.name}`);
        });

        return fileItem;
    }

    // Function to get appropriate icon based on file type
    function getFileIcon(mimeType) {
        if (mimeType.startsWith('image/')) return 'image';
        if (mimeType.startsWith('video/')) return 'videocam';
        if (mimeType.startsWith('audio/')) return 'audiotrack';
        if (mimeType.includes('pdf')) return 'picture_as_pdf';
        if (mimeType.includes('zip') || mimeType.includes('rar')) return 'archive';
        if (mimeType.includes('text') || mimeType.includes('document')) return 'description';
        return 'insert_drive_file';
    }

    // Add some sample files for demo
    const sampleFiles = [
        { name: 'Document.pdf', type: 'application/pdf' },
        { name: 'Image.jpg', type: 'image/jpeg' },
        { name: 'Video.mp4', type: 'video/mp4' },
        { name: 'Music.mp3', type: 'audio/mpeg' },
        { name: 'Archive.zip', type: 'application/zip' }
    ];

    sampleFiles.forEach(file => {
        const fileItem = createFileItem(file);
        filesGrid.appendChild(fileItem);
    });
});