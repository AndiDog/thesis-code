#import <UIKit/UIKit.h>

@interface OrderDetailViewController : UIViewController

@property (strong, nonatomic) NSManagedObject *order;

@property (nonatomic, strong) IBOutlet UILabel *headingLabel;

@property (nonatomic, strong) IBOutlet UIScrollView *thumbnailsTable;

@end
