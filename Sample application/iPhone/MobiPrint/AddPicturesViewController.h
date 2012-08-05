#import <UIKit/UIKit.h>

#import "OldOrdersViewController.h"

@interface AddPicturesViewController : UIViewController

+ (void)setOldOrdersViewController:(OldOrdersViewController*)controller;

@property (nonatomic, strong) IBOutlet UIBarButtonItem *addPictureButton;

@property (nonatomic, strong) IBOutlet UIButton *uploadPicturesButton;

@property (nonatomic, strong) IBOutlet UIScrollView *scrollView;

@end
