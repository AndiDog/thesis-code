#import <UIKit/UIKit.h>

#import "OldOrdersViewController.h"

@interface SubmitOrderViewController : UIViewController

@property (nonatomic, strong) IBOutlet UISwitch *confirmSwitch;

@property (nonatomic, strong) IBOutlet UIView *formView;

@property (nonatomic, strong) IBOutlet UIPickerView *storePicker;

@property (nonatomic, strong) IBOutlet UISearchBar *storeSearchBar;

@property (nonatomic, strong) IBOutlet UITextField *passwordField;

@property (nonatomic, strong) IBOutlet UITextField *usernameField;

@property (nonatomic, strong) IBOutlet UIScrollView *scrollView;

@property (nonatomic, strong) IBOutlet UIButton *submitButton;

@property (nonatomic, strong) IBOutlet UILabel *textLabel;

+ (void)setOldOrdersViewController:(OldOrdersViewController*)controller;

- (void)setOrder:(NSManagedObject*)order;

@end
