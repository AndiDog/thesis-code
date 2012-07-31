#import "OrderDetailViewController.h"
#import "ThumbnailDownloadHandler.h"

@implementation OrderDetailViewController

@synthesize order = _order;
@synthesize headingLabel;
@synthesize thumbnailsTable;

- (void)viewDidLoad
{
    [super viewDidLoad];

    if(self.order)
        [self relayout];

    [self startThumbnailDownloadOfPictureId:1];
}

- (void)viewDidUnload
{
    [super viewDidUnload];

    _order = nil;
}

- (BOOL)shouldAutorotateToInterfaceOrientation:(UIInterfaceOrientation)interfaceOrientation
{
    return YES;
}

- (void)relayout
{
    // Clear old subviews
    // TODO: only if displayed order is different
    NSArray *subviews = [self.thumbnailsTable.subviews copy];
    for(UIView *view in subviews)
        [view removeFromSuperview];

    NSArray *pictureIdsArray = [[self.order valueForKey:@"pictureIds"] componentsSeparatedByString:@","];
    NSMutableArray *pictureIds = [[NSMutableArray alloc] initWithCapacity:[pictureIdsArray count] - 1];

    for(NSString *pictureIdString in pictureIdsArray)
        if([pictureIdString length] > 0)
            [pictureIds addObject:[NSNumber numberWithInt:[pictureIdString intValue]]];

    int numPictures = [pictureIds count];
    int numUploadingPictures = 0;
    bool isOldOrder = [((NSString*)[self.order valueForKey:@"submissionDate"]) length] > 0;

    self.title = isOldOrder
                 ? NSLocalizedString(@"CurrentOrder", @"")
                 : NSLocalizedString(@"OldOrder", @"");

    self.headingLabel.text = [NSString stringWithFormat:NSLocalizedString(@"OrderHasNPicturesFmt", @""), numPictures + numUploadingPictures];

    const int screenWidth = self.thumbnailsTable.bounds.size.width;
    const int picturesPerRow = 3;
    const int cx = ((screenWidth - 6) / picturesPerRow) - 10;
    int x;
    int y;
    const int stateImageSize = 16;
    const int stateImagePaddingY = 4;

    UIImage *uploadingStateImg = [UIImage imageNamed:@"uploading.png"];
    UIImage *uploadedStateImg = [UIImage imageNamed:@"uploaded.png"];
    UIImage *printedStateImg = [UIImage imageNamed:@"printed.png"];
    UIImage *placeholderImg = [UIImage imageNamed:@"test-thumbnail.jpg"];
    UIFont *labelFont = [UIFont systemFontOfSize:14];

    for(int i = 0; i < numPictures + numUploadingPictures; ++i)
    {
        int pictureId;

        if(i < numPictures)
            pictureId = [[pictureIds objectAtIndex:i] intValue];
        else
            @throw [NSException exceptionWithName:@"Unimplemented" reason:@"" userInfo:nil];

        if(i % picturesPerRow == 0)
        {
            x = 8;

            if(i == 0)
                y = 0;
            else
                y += cx + stateImageSize * 2;
        }
        else
            x += cx + 10;

        NSString *thumbnailFilename = [ThumbnailDownloadHandler filenameForPictureId:pictureId];
        int thumbnailFileSize = 0;
        UIImageView *imageView = [[UIImageView alloc] initWithFrame:CGRectMake(x, y, cx, cx)];
        [imageView setContentMode:UIViewContentModeScaleAspectFit];

        if([[NSFileManager defaultManager] fileExistsAtPath:thumbnailFilename])
        {
            NSError *attributesError;
            NSDictionary *fileAttributes;
            if(!(fileAttributes = [[NSFileManager defaultManager] attributesOfItemAtPath:thumbnailFilename error:&attributesError]))
                NSLog(@"Failed to get attributes of thumbnail file: %@", [attributesError localizedDescription]);
            else
                thumbnailFileSize = [[fileAttributes objectForKey:NSFileSize] intValue];
        }

        if(thumbnailFileSize > 1000)
        {
            UIImage *img = [[UIImage alloc] initWithContentsOfFile:thumbnailFilename];
            [imageView setImage:img];
        }
        else
        {
            [imageView setImage:placeholderImg];

            [self startThumbnailDownloadOfPictureId:pictureId];
        }

        UILabel *label = [[UILabel alloc] initWithFrame:CGRectMake(x + stateImageSize + 2, y + cx + stateImagePaddingY, cx - stateImageSize - 2, stateImageSize)];
        UIImageView *stateImageView = [[UIImageView alloc] initWithFrame:CGRectMake(x, y + cx + stateImagePaddingY, stateImageSize, stateImageSize)];

        label.font = labelFont;

        // TODO: distinguish states
        if(true)
        {
            label.text = NSLocalizedString(@"Uploaded", @"");
            [stateImageView setImage:uploadedStateImg];
        }

        [imageView setTag:10000 + pictureId];

        [self.thumbnailsTable addSubview:imageView];
        [self.thumbnailsTable addSubview:label];
        [self.thumbnailsTable addSubview:stateImageView];
    }

    // Add a bit more space to the bottom (11)
    [self.thumbnailsTable setContentSize:CGSizeMake(screenWidth, y + cx + stateImageSize + stateImagePaddingY + 11)];
}

- (void)setOrder:(NSManagedObject*)order
{
    _order = order;

    // Relayout only if the view was loaded already
    if(self.thumbnailsTable.frame.size.width > 0)
        [self relayout];
}

-(void)showThumbnailErrorWithDescription:(NSString*)description
{
    [[[UIAlertView alloc] initWithTitle:NSLocalizedString(@"Error", @"")
                                message:[NSString stringWithFormat:@"%@: %@", NSLocalizedString(@"FailedToDownloadThumbnail", @""), description]
                               delegate:nil
                      cancelButtonTitle:NSLocalizedString(@"DismissError", @"")
                      otherButtonTitles:nil] show];
}

-(void)startThumbnailDownloadOfPictureId:(int)pictureId
{
    [[[ThumbnailDownloadHandler alloc] initWithPictureId:pictureId resultDelegate:self] go];
}

-(void)thumbnailDownloadError:(NSString*)error
{
    [self showThumbnailErrorWithDescription:error];
}

- (void)thumbnailDownloadSuccess:(int)pictureId
{
    NSLog(@"Success callback: %d", pictureId);

    UIImageView *imageView = (UIImageView*)[self.thumbnailsTable viewWithTag:10000 + pictureId];
    NSString *thumbnailFilename = [ThumbnailDownloadHandler filenameForPictureId:pictureId];
    UIImage *img = [[UIImage alloc] initWithContentsOfFile:thumbnailFilename];
    [imageView setImage:img];
}

@end
