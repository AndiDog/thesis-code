#import "SubmitOrderViewController.h"
#import "NSString+CountString.h"

@implementation SubmitOrderViewController
{
    NSManagedObject *_order;
}

@synthesize confirmSwitch;
@synthesize formView;
@synthesize storeResultsView;
@synthesize usernameField;
@synthesize passwordField;
@synthesize scrollView;
@synthesize submitButton;
@synthesize textLabel;

- (void)viewDidLoad
{
    [super viewDidLoad];

    [self.passwordField addTarget:self action:@selector(onPasswordFieldReturnPressed) forControlEvents:UIControlEventEditingDidEndOnExit];
    [self.usernameField addTarget:self action:@selector(onUsernameFieldReturnPressed) forControlEvents:UIControlEventEditingDidEndOnExit];

    int numPics = [((NSString*)[_order valueForKey:@"pictureIds"]) countOccurencesOfString:@","];
    self.textLabel.text = [NSString stringWithFormat:NSLocalizedString(@"SubmitTextFmt", @""), numPics];

    self.scrollView.contentSize = CGSizeMake(self.scrollView.contentSize.width,
                                             self.formView.frame.origin.y + self.formView.frame.size.height);
}

- (BOOL)shouldAutorotateToInterfaceOrientation:(UIInterfaceOrientation)interfaceOrientation
{
    return YES;
}

- (void)setOrder:(NSManagedObject*)order
{
    _order = order;
}

- (void)onUsernameFieldReturnPressed
{
    [self.passwordField becomeFirstResponder];
}

- (void)onPasswordFieldReturnPressed
{
    [self.passwordField endEditing:true];
}

@end
