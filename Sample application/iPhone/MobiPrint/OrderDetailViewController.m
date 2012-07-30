#import "OrderDetailViewController.h"

@implementation OrderDetailViewController

@synthesize order = _order;

- (void)viewDidLoad
{
    [super viewDidLoad];
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
    self.title = [((NSString*)[self.order valueForKey:@"submissionDate"]) length] == 0
                 ? NSLocalizedString(@"CurrentOrder", @"")
                 : NSLocalizedString(@"OldOrder", @"");
}

- (void)setOrder:(NSManagedObject*)order
{
    _order = order;

    [self relayout];
}

@end
