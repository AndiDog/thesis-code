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

    int numPictures = 9;
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
    UIFont *labelFont = [UIFont systemFontOfSize:14];

    for(int i = 0; i < numPictures + numUploadingPictures; ++i)
    {
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

        UIImageView *imageView = [[UIImageView alloc] initWithFrame:CGRectMake(x, y, cx, cx)];
        [imageView setImage:[UIImage imageNamed:@"test-thumbnail.jpg"]];

        UILabel *label = [[UILabel alloc] initWithFrame:CGRectMake(x + stateImageSize + 2, y + cx + stateImagePaddingY, cx - stateImageSize - 2, stateImageSize)];
        UIImageView *stateImageView = [[UIImageView alloc] initWithFrame:CGRectMake(x, y + cx + stateImagePaddingY, stateImageSize, stateImageSize)];

        label.font = labelFont;

        // TODO: distinguish states
        if(true)
        {
            label.text = NSLocalizedString(@"Uploaded", @"");
            [stateImageView setImage:uploadedStateImg];
        }

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
                                message:[NSString stringWithFormat:@"%@: %@", NSLocalizedString(@"FailedToUpdateOrders", @""), description]
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

@end
