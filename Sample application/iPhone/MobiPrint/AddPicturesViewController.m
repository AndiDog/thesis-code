#import "AddPicturesViewController.h"
#import "PictureUploadHandler.h"

@interface AddPicturesViewController() <UIImagePickerControllerDelegate, UINavigationControllerDelegate, PictureUploadDelegateProtocol>

@end

@implementation AddPicturesViewController
{
    int _displayWidth, _y;

    // Array of UIImage
    NSMutableArray *_pickedImages;

    // Array of booleans (NSNumber 0 or 1)
    NSMutableArray *_selected;

    // UIImage => PictureUploadHandler (needed for ARC so that the upload handler doesn't get released during the HTTP request)
    NSMutableDictionary *_uploadHandlers;
}

@synthesize addPictureButton;
@synthesize scrollView;
@synthesize uploadPicturesButton;

- (id)initWithNibName:(NSString *)nibNameOrNil bundle:(NSBundle *)nibBundleOrNil
{
    self = [super initWithNibName:nibNameOrNil bundle:nibBundleOrNil];
    if(self)
    {
    }
    return self;
}

- (void)viewDidLoad
{
    self.addPictureButton.target = self;
    self.addPictureButton.action = @selector(onAddPictureButtonTapped);

    [self.uploadPicturesButton addTarget:self action:@selector(onUploadPicturesButtonTapped) forControlEvents:UIControlEventTouchUpInside];

    [super viewDidLoad];

    _uploadHandlers = [[NSMutableDictionary alloc] init];
    _pickedImages = [[NSMutableArray alloc] init];
    _selected = [[NSMutableArray alloc] init];

    [self relayout:true];
}

- (void)viewDidUnload
{
    _pickedImages = nil;

    [super viewDidUnload];
}

- (BOOL)shouldAutorotateToInterfaceOrientation:(UIInterfaceOrientation)interfaceOrientation
{
    return YES;
}

-(void)showErrorWithDescription:(NSString*)description
{
    [[[UIAlertView alloc] initWithTitle:NSLocalizedString(@"Error", @"")
                                message:[NSString stringWithFormat:@"%@: %@", NSLocalizedString(@"FailedToAddPicture", @""), description]
                               delegate:nil
                      cancelButtonTitle:NSLocalizedString(@"DismissError", @"")
                      otherButtonTitles:nil] show];
}

- (void)onAddPictureButtonTapped
{
    if(![UIImagePickerController isSourceTypeAvailable:
        UIImagePickerControllerSourceTypePhotoLibrary])
    {
        [self showErrorWithDescription:@"Photo library not available"];
        return;
    }

    UIImagePickerController *picker = [[UIImagePickerController alloc] init];
    picker.delegate = self;
    picker.sourceType = UIImagePickerControllerSourceTypePhotoLibrary;
    [self presentModalViewController:picker animated:YES];
}

-(void)imagePickerController:(UIImagePickerController *)picker didFinishPickingImage:(UIImage*)image editingInfo:(NSDictionary*)editingInfo
{
    PictureUploadHandler *handler = [[PictureUploadHandler alloc] initWithImage:image target:(PictureUploadDelegate*)self];
    [_uploadHandlers setObject:handler forKey:image];
    [handler startPictureUpload];
    return;

    [picker dismissModalViewControllerAnimated:YES];

    [_pickedImages addObject:image];
    [_selected addObject:[NSNumber numberWithInt:1]];

    [self relayout:false];
    CGSize scrollSize = self.scrollView.contentSize;
    [self.scrollView scrollRectToVisible:CGRectMake(0, scrollSize.height - 1, scrollSize.width, 1) animated:true];
}

-(void)imagePickerControllerDidCancel:(UIImagePickerController*)picker
{
    [picker dismissModalViewControllerAnimated:YES];
}

- (void)onUploadPicturesButtonTapped
{
    NSLog(@"upload tapped!");
}

- (void)didRotateFromInterfaceOrientation:(UIInterfaceOrientation)fromInterfaceOrientation
{
    [self relayout:true];
}

- (void)relayout:(bool)full
{
    if(full)
    {
        if([_pickedImages count] > 0)
        {
            NSArray *subviews = [[self.scrollView subviews] copy];
            for(UIView *subview in subviews)
                [subview removeFromSuperview];
        }

        _displayWidth = self.scrollView.frame.size.width - 16;
        _y = 8;
    }

    UIFont *font = [UIFont systemFontOfSize:14];

    for(int i = full ? 0 : [_pickedImages count] - 1; i < [_pickedImages count]; ++i)
    {
        UIImage *img = [_pickedImages objectAtIndex:i];

        int cx, cy;

        cy = img.size.height * _displayWidth / img.size.width;
        if(cy > img.size.height)
        {
            cx = img.size.width;
            cy = img.size.height;
        }
        else
            cx = _displayWidth;

        UIImageView *imageView = [[UIImageView alloc] initWithImage:img];
        imageView.contentMode = UIViewContentModeScaleAspectFit;
        imageView.frame = CGRectMake((_displayWidth + 16 - cx) / 2, _y, cx, cy);

        UISwitch *selectedSwitch = [[UISwitch alloc] initWithFrame:CGRectZero];
        selectedSwitch.frame = CGRectMake(8,
                                          _y + cy + 8,
                                          selectedSwitch.frame.size.width,
                                          selectedSwitch.frame.size.height);
        selectedSwitch.on = [[_selected objectAtIndex:i] intValue] ? true : false;
        selectedSwitch.tag = 10000 + i;
        [selectedSwitch addTarget:self action:@selector(onSwitchValueChanged:) forControlEvents:UIControlEventValueChanged];

        UILabel *label = [[UILabel alloc] initWithFrame:CGRectMake(8 + selectedSwitch.frame.size.width + 8, _y + cy + 8, _displayWidth - selectedSwitch.frame.size.width - 40, selectedSwitch.frame.size.height)];
        label.font = font;
        label.text = NSLocalizedString(@"AddAbovePicture", @"");

        _y += cy + 8 + selectedSwitch.frame.size.height + 20;

        [self.scrollView addSubview:imageView];
        [self.scrollView addSubview:selectedSwitch];
        [self.scrollView addSubview:label];
        [self.scrollView setContentSize:CGSizeMake(self.scrollView.frame.size.width, _y)];
    }
}

- (void)onSwitchValueChanged:(id)sender
{
    UISwitch *selectedSwitch = sender;
    int index = selectedSwitch.tag - 10000;

    [_selected replaceObjectAtIndex:index withObject:[NSNumber numberWithInt:selectedSwitch.on]];
}

- (void)pictureUploadFinished:(UIImage*)img error:(NSString*)error
{
    [_uploadHandlers removeObjectForKey:img];

    NSLog(@"Upload finished with error (%@)", error);
}

@end
