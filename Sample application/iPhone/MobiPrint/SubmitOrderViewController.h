#import <UIKit/UIKit.h>

@interface SubmitOrderViewController : UIViewController

@property (nonatomic, strong) IBOutlet UISwitch *confirmSwitch;

@property (nonatomic, strong) IBOutlet UIView *formView;

@property (nonatomic, strong) IBOutlet UIView *storeResultsView;

@property (nonatomic, strong) IBOutlet UITextField *passwordField;

@property (nonatomic, strong) IBOutlet UITextField *usernameField;

@property (nonatomic, strong) IBOutlet UIScrollView *scrollView;

@property (nonatomic, strong) IBOutlet UIButton *submitButton;

@property (nonatomic, strong) IBOutlet UILabel *textLabel;

- (void)setOrder:(NSManagedObject*)order;

@end
